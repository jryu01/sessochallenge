"use strict";

const PriorityQueue = require("./priority-queue");

// Print all entries, across all of the sources, in chronological order.

module.exports = (logSources, printer) => {
  // Priority queue makes sure that queued item gets dequeued in order such that item with the smallest date comes out first. 
  const queue = new PriorityQueue((a, b) => {
    return a.logEntry.date < b.logEntry.date;
  });

  // Enqueue first log entry from all sources
  logSources.forEach(logSource => {
    const logEntry = logSource.pop();
    if (logEntry !== false) {
      queue.enqueue({
        logSource,
        logEntry
      });
    }
  });

  // Dequeue and print the log entry with the smallest date in the queue and add the next log entry from the same source to the queue. 
  // Repeat this until the queue is empty
  while (!queue.isEmpty()) {
    const { logSource, logEntry } = queue.dequeue();
    printer.print(logEntry);
    const nextEntry = logSource.pop();
    if (nextEntry !== false) {
      queue.enqueue({ logSource, logEntry: nextEntry })
    }
  }
  printer.done();

  return console.log("Sync sort complete.");
};