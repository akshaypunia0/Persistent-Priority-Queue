import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";


class PersistentPriorityQueue {
    constructor(filePath = "./data/queue.json") {
        this.filePath = filePath
        this.items = []
        this._loadFromFile()
    }


    _loadFromFile() {
        const directoryPath = path.dirname(this.filePath)

        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath, { recursive: true })
        }

        if (!fs.existsSync(this.filePath)) {
            fs.writeFileSync(this.filePath, "[]", "utf-8");
            this.items = [];
            return;
        }

        try {
            const fileData = fs.readFileSync(this.filePath, "utf-8");

            if (fileData.trim() === "") {
                this.items = [];
                fs.writeFileSync(this.filePath, "[]", "utf-8");
                return;
            }

            const parsedData = JSON.parse(fileData);

            if (!Array.isArray(parsedData)) {
                throw new Error("Storage data is not an array.");
            }

            this.items = parsedData;
        } catch (error) {
            throw new Error(
                `Failed to load priority queue from file: ${error.message}`
            );
        }
    }


    _saveToFile() {
        const temporaryFilePath = `${this.filePath}.tmp`;

        try {
            const jsonData = JSON.stringify(this.items, null, 2);

            fs.writeFileSync(temporaryFilePath, jsonData, "utf-8");
            fs.renameSync(temporaryFilePath, this.filePath);
        } catch (error) {
            throw new Error(
                `Failed to save priority queue to file: ${error.message}`
            );
        }
    }


    _validatePriority(priority) {
        if (typeof priority !== "number" || !Number.isFinite(priority)) {
            throw new TypeError("Priority must be a finite number.");
        }
    }


    _validateValue(value) {
        if (value === undefined) {
            throw new TypeError("Value cannot be undefined.");
        }

        try {
            const serializedValue = JSON.stringify(value);

            if (serializedValue === undefined) {
                throw new Error();
            }
        } catch {
            throw new TypeError("Value must be JSON-serializable.");
        }
    }


    _findMinIndex() {
        if (this.items.length === 0) {
            return -1;
        }

        let minIndex = 0;

        for (let index = 1; index < this.items.length; index++) {
            if (this.items[index].priority < this.items[minIndex].priority) {
                minIndex = index;
            }
        }

        return minIndex;
    }


    _findMaxIndex() {
        if (this.items.length === 0) {
            return -1;
        }

        let maxIndex = 0;

        for (let index = 1; index < this.items.length; index++) {
            if (this.items[index].priority > this.items[maxIndex].priority) {
                maxIndex = index;
            }
        }

        return maxIndex;
    }


    _findItemIndex(id) {
        if (typeof id !== "string" || id.trim() === "") {
            throw new TypeError("Item ID must be a non-empty string.");
        }

        return this.items.findIndex((item) => item.id === id);
    }




    // Public methods starts here
    is_empty() {
        return this.items.length === 0;
    }

    insert(value, priority) {
        this._validateValue(value);
        this._validatePriority(priority);

        const newItem = {
            id: randomUUID(),
            value,
            priority,
            createdAt: new Date().toISOString(),
            updatedAt: null
        };

        this.items.push(newItem);
        this._saveToFile();

        return newItem;
    }

    peek(type = "min") {
        if (this.is_empty()) {
            return null;
        }

        if (type !== "min" && type !== "max") {
            throw new TypeError('Peek type must be either "min" or "max".');
        }

        const itemIndex =
            type === "min"
                ? this._findMinIndex()
                : this._findMaxIndex();

        return this.items[itemIndex];
    }

    extract_min() {
        if (this.is_empty()) {
            return null;
        }

        const minIndex = this._findMinIndex();
        const [removedItem] = this.items.splice(minIndex, 1);

        this._saveToFile();

        return removedItem;
    }

    extract_max() {
        if (this.is_empty()) {
            return null;
        }

        const maxIndex = this._findMaxIndex();
        const [removedItem] = this.items.splice(maxIndex, 1);

        this._saveToFile();

        return removedItem;
    }

    update(id, updates) {
        const itemIndex = this._findItemIndex(id);

        if (itemIndex === -1) {
            return null;
        }

        if (
            updates === null ||
            typeof updates !== "object" ||
            Array.isArray(updates)
        ) {
            throw new TypeError("Updates must be an object.");
        }

        const allowedFields = ["value", "priority"];
        const updateFields = Object.keys(updates);

        if (updateFields.length === 0) {
            throw new Error("At least one field must be provided for update.");
        }

        const invalidFields = updateFields.filter(
            (field) => !allowedFields.includes(field)
        );

        if (invalidFields.length > 0) {
            throw new Error(
                `Invalid update fields: ${invalidFields.join(", ")}`
            );
        }

        if (Object.hasOwn(updates, "value")) {
            this._validateValue(updates.value);
            this.items[itemIndex].value = updates.value;
        }

        if (Object.hasOwn(updates, "priority")) {
            this._validatePriority(updates.priority);
            this.items[itemIndex].priority = updates.priority;
        }

        this.items[itemIndex].updatedAt = new Date().toISOString();

        this._saveToFile();

        return this.items[itemIndex];
    }

    delete(id) {
        const itemIndex = this._findItemIndex(id);

        if (itemIndex === -1) {
            return null;
        }

        const [deletedItem] = this.items.splice(itemIndex, 1);

        this._saveToFile();

        return deletedItem;
    }




}

export default PersistentPriorityQueue