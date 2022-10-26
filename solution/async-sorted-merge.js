"use strict";

const PriorityQueue = require("./priority-queue");

// Print all entries, across all of the *async* sources, in chronological order.
module.exports = async (logSources, printer) => {
  // Priority queue makes sure that queued item gets dequeued in order such that item with the smallest date comes out first. 
  const queue = new PriorityQueue((a, b) => {
    return a.logEntry.date < b.logEntry.date;
  });

  // Enqueue first log entry from all sources
  // Execute popAsync from all sources concurrently for the efficiency since they can be executed independently without waiting for another to be finished
  const logEntryPromises = logSources.map(logSource => logSource.popAsync());
  const logEntries = await Promise.all(logEntryPromises);

  logSources.forEach((logSource, index) => {
    const logEntry = logEntries[index];
    if (logEntry !== false) {
      queue.enqueue({
        logSource,
        logEntry
      })
    }
  });

  // Dequeue and print the log entry with the smallest date in the queue and add the next log entry from the same source to the queue. 
  // Repeat this until the queue is empty
  while (!queue.isEmpty()) {
    const { logSource, logEntry } = queue.dequeue();
    printer.print(logEntry);
    // Enqueue next log entry from the same source
    const nextEntry = await logSource.popAsync();
    if (nextEntry != false) {
      queue.enqueue({
        logSource,
        logEntry: nextEntry
      });
    }
  }
  printer.done();

  return console.log("Async sort complete.");
};
