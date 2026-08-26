# Persistent Priority Queue

A persistent priority queue implemented in JavaScript using an unsorted array and JSON file storage. The queue supports both minimum- and maximum-priority operations, and its state remains available after the program restarts.

## Requirements

- Node.js 18 or later
- ES modules enabled using `"type": "module"` in `package.json`

No external dependencies are required.

## Project Structure

```text
persistent-priority-queue/
├── data/
│   └── queue.json
├── module.js
├── test.js
├── package.json
└── README.md  # Automatically generated at runtime
```

## Usage

```js
import PersistentPriorityQueue from "./module.js";

const queue = new PersistentPriorityQueue("./data/queue.json");

const taskA = queue.insert("Send email", 3);
const taskB = queue.insert("Process payment", 1);
const taskC = queue.insert("Generate report", 5);

console.log(queue.peek("min")); // Process payment
console.log(queue.peek("max")); // Generate report

queue.update(taskA.id, { priority: 2 });
queue.delete(taskB.id);

console.log(queue.extract_min());
console.log(queue.extract_max());
console.log(queue.is_empty());
```

Run the example or tests with:

```bash
node test.js
```

## Public API

| Method | Description | Return value |
|---|---|---|
| `insert(value, priority)` | Inserts an item and generates a unique ID | Created item |
| `extract_min()` | Removes and returns the minimum-priority item | Item or `null` |
| `extract_max()` | Removes and returns the maximum-priority item | Item or `null` |
| `peek(type = "min")` | Returns the minimum or maximum item without removing it | Item or `null` |
| `update(id, updates)` | Updates an item's `value` and/or `priority` | Updated item or `null` |
| `delete(id)` | Deletes an item by ID | Deleted item or `null` |
| `is_empty()` | Checks whether the queue is empty | Boolean |

`priority` must be a finite number, and `value` must be JSON-serializable. When multiple items have the same priority, they are processed in insertion order.

## Implementation

Items are stored in an unsorted array. Insertion is constant time, while minimum, maximum, update, and deletion operations scan the array. Every modifying operation writes the updated state to `queue.json`; the constructor reloads that state when a new queue instance is created.

| Operation | Time complexity |
|---|---:|
| `insert` | `O(1)` in memory, `O(n)` including persistence |
| `extract_min` | `O(n)` |
| `extract_max` | `O(n)` |
| `peek` | `O(n)` |
| `update` | `O(n)` |
| `delete` | `O(n)` |
| `is_empty` | `O(1)` |

The array-based design keeps both minimum and maximum operations simple and readable. For large-scale or concurrent workloads, a min-max heap, synchronized heaps, or a transactional database would be more suitable.

## Real-World Use Cases

- Scheduling background jobs by urgency
- Processing critical notifications before routine messages
- Hospital emergency triage
- Operating-system process scheduling
- Network packet prioritization
- Selecting the next node in pathfinding algorithms

## Limitations

- The complete JSON file is rewritten after every modification.
- The implementation is intended for a single Node.js process.
- Concurrent writers require file locking or database transactions.
