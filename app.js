const { createApp, ref } = Vue

createApp({
    setup() {
        const showOverlay = ref(false);
        const parsedCSV = ref([]);
        const images = ref({});
        const selected_game_row = ref({});
        const selected_game_image = ref("");

        function select_game(row, image_url) {
            showOverlay.value = true;
            selected_game_row.value = row;
            selected_game_image.value = image_url;
        }

        function loadCSV() {
            fetch("games-finished.csv")
                .then(response => response.text())
                .then(csv => Papa.parse(csv, {
                    complete(parseResult) {
                        parseResult.data.shift();
                        parsedCSV.value = parseResult.data;
                    }
                }))
                .catch(error => console.error("Error fetching games list:", error));

            fetch("game-covers.json")
                .then(response => response.json())
                .then(json => images.value = json)
                .catch(error => console.error("Error fetching images:", error));
        }

        loadCSV();

        return {
            select_game,
            loadCSV,
            showOverlay,
            parsedCSV,
            images,
            selected_game_row,
            selected_game_image
        };
    }
}).mount('body');
