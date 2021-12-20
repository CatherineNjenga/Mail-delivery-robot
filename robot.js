var roads = [
    "Alice's House-Bob's House",   "Alice's House-Cabin",
    "Alice's House-Post Office",   "Bob's House-Town Hall",
    "Daria's House-Ernie's House", "Daria's House-Town Hall",
    "Ernie's House-Grete's House", "Grete's House-Farm",
    "Grete's House-Shop",          "Marketplace-Farm",
    "Marketplace-Post Office",     "Marketplace-Shop",
    "Marketplace-Town Hall",       "Shop-Town Hall"
];
function buildGraph(edges){
    let graph = Object.create(null);
    function addEdge(from,to){
      if(graph[from]==null){
        graph[from]=[to];
      }else{
        graph[from].push(to);
      }
    }
    for(let [from,to] of edges.map(r => r.split("-"))){
      addEdge(from,to);
      addEdge(to,from);
    }
    return graph;
  
}
export var roadGraph = buildGraph(roads);

   
export var VillageState  = class VillageState {
    constructor(place,parcels){
      this.place = place;
      this.parcels = parcels;
    }

    move(destination){
      if(!roadGraph[this.place].includes(destination)){
        return this;
      }else{
        let parcels = this.parcels.map(p =>{
          if(p.place != this.place) return p;
          return {place:destination, address:p.address};
          //filter() working reversly
        }).filter(p => p.place != p.address)
        return new VillageState(destination,parcels);
      }
    }
}

  
export function runRobot(state,robot,memory){
    console.log("Post Office");
    printParcels();
    for(let turn=0;;turn++){
      if(state.parcels.length==0){
        console.log(`Done in ${turn} turns`);
        break;
      }
      let action = robot(state,memory);
      state = state.move(action.direction);
      memory = action.memory;
      console.log(`Moved to ${action.direction}`);
      printParcels();
      
    }

    // Print a message either to the console or to the document

    // function log(message){
    //   if(typeof document === 'undefined'){
    //     console.log(message);
    //   } else {
    //     document.write(`${message} <br>`);
    //   }
    // }
    
    
    // Print the list of parcels
    
    function printParcels(){
      let parcelString = "";
      state.parcels.forEach(p => {
        parcelString += `${p.place[0]}→${p.address[0]},`
      });
      console.log(` [${parcelString.slice(0, -2)}] (${state.parcels.length})`)
    }
}

function randomPick(array){
    let choice = Math.floor(Math.random()*array.length);
    // console.log(array[choice])
    return array[choice];
  } 
  
  
export function randomRobot(state){
    return {direction:randomPick(roadGraph[state.place])};
  }
  
  
VillageState.random = function(parcelCount=5){
    let parcels = [];
    for(let i=0;i<parcelCount;i++){
      let address = randomPick(Object.keys(roadGraph));
      let place;
      do {
        place = randomPick(Object.keys(roadGraph));
      }while (place==address)
      parcels.push({place,address});
    }
    console.log(parcels)
    return new VillageState("Post Office", parcels);  
};

var mailRoute = [
    "Alice's House", "Cabin", "Alice's House", "Bob's House",
    "Town Hall", "Daria's House", "Ernie's House",
    "Grete's House", "Shop", "Grete's House", "Farm",
    "Marketplace", "Post Office"
];

export function routeRobot(state,memory){
    if(memory.length==0){
        memory = mailRoute;
    }
    return {direction:memory[0],memory:memory.slice(1)};
}

console.log(runRobot(VillageState.random(), routeRobot,[]));

function findRoute(graph ,from ,to){
  let work =[{at:from, route:[]}];
  for(let i=0;i<work.length;i++){
    let {at,route} = work[i];
    for(let place of graph[at]){
      if (place==to) return route.concat(place);
      if(!work.some(w => w.at==place)){
        work.push({at:place, route:route.concat(place)})
      }
    }
  }
}

export function goalOrientedRobot({place,parcels}, route){
  if(route.length==0){
    let parcel = parcels[0];
    if(parcel.place != place){
      route = findRoute(roadGraph,place, parcel.place);
    } else {
      route = findRoute(roadGraph, place, parcel.address);
    }
  }
  return {direction:route[0], memory:route.splice(1)};
}

console.log(runRobot(VillageState.random(), goalOrientedRobot,[]));

export function parcelsNode(place, parcels, graph) {
  let keys = Object.keys(graph);
    
    /*
  let nodesMap = new Map(keys.map((k) => [k,{in: 0, out: 0}]));
  console.log(nodesMap);
  console.log(nodesMap.get('Cabin').in);
  */
  let nodes = {};
  for (let k of keys) {
    nodes[k] = {in: 0, out: 0};   
  }
  for (let [i,p] of parcels.entries()) {
    if (p.place != place) {   // not on robot's hand
      nodes[p.place].in += 1;
      nodes[p.place].index = i;
    }
    nodes[p.address].out += 1;
    if (nodes[p.address].index == undefined)
      nodes[p.address].index = i;
  }
  return nodes;
}
/**
 * Gets the nodes of the graph with the maximum number of parcels to send
 * and the maximum number of parcels addressed to.
 * 
 * @param {Object<string:Object<number,number,number>>} nodes number of parcels in a node, and parcels to a node.
 * @returns {Array<number,number>} key of the nodes with maximum 'in' and 'out' values.
 */
export function maxNode (nodes) {
  let keys = Object.keys(nodes);
  return [keys.reduce((a, b) => nodes[a].in > nodes[b].in ? a : b),
          keys.reduce((a, b) => nodes[a].out > nodes[b].out ? a : b)];
}

// export default {
//   roadGraph,
//   VillageState,
//   randomRobot,
//   routeRobot,
//   goalOrientedRobot,
// }
