// Ephemeral UI state only. Never modifies the Atlas semantic model.
export function createPerspectiveMemory(){
  const states=new Map();
  const copy=state=>({
    positions:(state.positions||[]).map(({id,position})=>({id,position:{x:position.x,y:position.y}})),
    zoom:state.zoom,pan:{x:state.pan.x,y:state.pan.y},
    collapsed:[...(state.collapsed||[])]
  });
  return {
    save(key,state){if(!key)throw new Error('Perspective key required');states.set(key,copy(state));},
    get(key){const state=states.get(key);return state?copy(state):null;},
    keys(){return [...states.keys()];}
  };
}
