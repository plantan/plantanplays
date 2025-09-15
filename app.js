const { createApp, ref } = Vue

createApp({
    setup() {
        const parsedCSV = ref([]);
        const images = ref({});

        function loadCSV() {
            fetch("games-finished.csv")
            .then(response => response.text())
            .then(csv => Papa.parse(csv, { complete(parseResult) 
                { 
                    parseResult.data.shift();
                    parsedCSV.value = parseResult.data;
                }}))
            .catch(error => console.error("Error fetching games list:", error));

            fetch("game-covers.json")
            .then(response => response.json())
            .then(json => images.value = json)
            .catch(error => console.error("Error fetching images:", error));
        }

        loadCSV();

        return {
            loadCSV,
            parsedCSV,
            images
        };
    }
}).mount('#app');
