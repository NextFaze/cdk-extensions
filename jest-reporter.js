class BazelReporter {
  onRunComplete(_, results) {
    if (results.numFailedTests && results.snapshot.failure) {
      console.log(`================================================================================
      
      Snapshot failed, you can update the snapshot by running
      npm run test:update
      `);
    }
  }
}

module.exports = BazelReporter;
