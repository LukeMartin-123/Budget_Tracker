const request = indexedDB.open("budgetDatabase", 1);

    request.onupgradeneeded = event => {
      const db = event.target.result;

      db.createObjectStore("pending", { autoIncrement: true });
    };

    request.onerror = (event) => {
      console.log("Oh no! " + event.target.errorCode);
    }


    request.onsuccess = ({ target }) => {
      db = target.result;

      if (navigator.onLine) {
        checkDatabase();
      }
    };

    function saveRecord(record) {
      const transaction = db.transaction(["pending"], "readwrite");
      const store = transaction.objectStore("pending");

      store.add(record);
    }


    function checkDatabase() {
      const transaction = db.transaction(["pending"], "readwrite");
      const store = transaction.objectStore("pending");
      const getAll = store.getAll();
      
      getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
          fetch("/api/transaction/bulk", {
            method: "POST",
            body: JSON.stringify(getAll.result),
            headers: {
              Accept: "application/json, text/plain, */*",
              "Content-Type": "application/json"
            }
          })
            .then(response => {
              return response.json();
            })
            .then(() => {
              // delete records if successful
              const transaction = db.transaction(["pending"], "readwrite");
              const budgetStore = transaction.objectStore("pending");
              budgetStore.clear();
            });
        }
      };
    }