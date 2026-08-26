import PersistentPriorityQueue from "./module.js";

const queue = new PersistentPriorityQueue("./data/queue.json");

console.log("Initially empty:", queue.is_empty());

const taskA = queue.insert("Task A", 3);
const taskB = queue.insert("Task B", 1);
const taskC = queue.insert("Task C", 5);

console.log("Inserted Task A:", taskA);
console.log("Inserted Task B:", taskB);
console.log("Inserted Task C:", taskC);

console.log("Is empty after insertion:", queue.is_empty());

console.log("Minimum item:", queue.peek("min"));
console.log("Maximum item:", queue.peek("max"));

const updatedTask = queue.update(taskA.id, {
  value: "Updated Task A",
  priority: 10
});

console.log("Updated item:", updatedTask);

const deletedTask = queue.delete(taskB.id);

console.log("Deleted item:", deletedTask);

const minimumItem = queue.extract_min();
console.log("Extracted minimum:", minimumItem);

const maximumItem = queue.extract_max();
console.log("Extracted maximum:", maximumItem);

console.log("Finally empty:", queue.is_empty());