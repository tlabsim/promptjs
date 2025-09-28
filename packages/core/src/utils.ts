/**
 * PromptJS – utils.ts
 * Small internal utilities shared across modules.
 * Author: Iftekhar Mahmud Towhid (tlabs.im@gmail.com)
 *
 * Includes:
 *   - uid(prefix): generate short unique ids for instances (e.g., 'pj-abc123')
 *   - createNanoEvents(): tiny event emitter (on/off/emit)
 *   - setAttributes(el, attrs): batch-assign attributes safely
 *
 * Keep this file dependency-free and stable—other modules assume these helpers exist.
 */

export function uid(prefix='pj'){ return `${prefix}-${Math.random().toString(36).slice(2,8)}`; }

// This is a minimal event emitter implementation, inspired by nanoevents (https://github.com/ai/nanoevents)
export function createNanoEvents(){
  const map = new Map<string, Set<Function>>();
  return {
    on(t:string, fn:Function){ if(!map.has(t)) map.set(t,new Set()); map.get(t)!.add(fn); },
    off(t:string, fn:Function){ map.get(t)?.delete(fn); },
    emit(t:string, ...a:any[]){ map.get(t)?.forEach(fn=>fn(...a)); }
  };
}

export function setAttributes(el: HTMLElement, attrs: Record<string,string|number|boolean|undefined>){
  for (const [k,v] of Object.entries(attrs)) if (v !== undefined) el.setAttribute(k, String(v));
}
