// Helper to create a function for filtering an array of objects:
// Eg: myArray.filter( by({ name:'foo', type:'bar' }) )
export default function by(props = {}) {
    const keys = Object.keys(props);
    return item => keys.every(key => item &&
        (Array.isArray(item)
            ? item[0] === key && item[1] === props[key]
            : item[key] === props[key]));
}
