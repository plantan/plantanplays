const { createApp, ref, onMounted, onBeforeUnmount } = Vue

createApp({
    setup() {
        const showOverlay = ref(false);
        const parsedCSV = ref([]);
        const year = ref("");
        const years = ref([]);
        const platforms = ref([]);
        const platform = ref("");
        const search = ref("");
        const igdb = ref({});
        const selected_game_row = ref({});
        const selected_game_image = ref("");
        const star_canvas = ref(null);

        function select_game(row, image_url) {
            showOverlay.value = true;
            selected_game_row.value = row;
            selected_game_image.value = image_url;
        }

        function loadCSV() {
            fetch("igdb.json")
                .then(response => response.json())
                .then(json => igdb.value = json)
                .finally(() => {
                    fetch("games-finished.csv")
                        .then(response => response.text())
                        .then(csv => Papa.parse(csv, {
                            complete(parseResult) {
                                parseResult.data.shift();
                                parsedCSV.value = parseResult.data;
                                parsedCSV.value.sort((a, b) => {
                                    const dateA = new Date(a[1] === '' ? igdb.value[a[4]].date : new Date(a[1]));
                                    const dateB = new Date(b[1] === '' ? igdb.value[b[4]].date : new Date(b[1]));
                                    return dateB - dateA;
                                });

                                parseResult.data.forEach(row => {
                                    const year = new Date(row[1]).getFullYear();
                                    if (!isNaN(year) && years.value.indexOf(year) === -1) {
                                        years.value.push(year);
                                    }

                                    const platform = row[3];
                                    if (platforms.value.indexOf(platform) === -1) {
                                        platforms.value.push(platform);
                                    }
                                });

                                years.value.sort((a, b) => b - a);
                                platforms.value.sort();
                            }
                        }));
                });
        }

        loadCSV();

        function set_banner_height() {
            const banner = document.getElementById('banner');
            document.documentElement.style.setProperty("--banner-height", banner.height + 'px');
        }

        let animationId;
        onMounted(() => {
            window.addEventListener("load", set_banner_height);
            window.addEventListener("resize", set_banner_height);

            const canvas = star_canvas.value;
            const ctx = canvas.getContext("2d");

            function resize() {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
            window.addEventListener("resize", resize);
            resize();

            const starCount = 120;
            const stars = Array.from({ length: starCount }, () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 1.5 + 0.5,
                alpha: Math.random(),
                blinkSpeed: Math.random() * 0.02 + 0.005,
                dx: (Math.random() - 0.5) * 0.2,
                dy: (Math.random() - 0.5) * 0.2,
            }));

            function animate() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                for (const s of stars) {
                    // Blink
                    s.alpha += s.blinkSpeed;
                    if (s.alpha > 1 || s.alpha < 0) s.blinkSpeed *= -1;

                    // Drift
                    s.x += s.dx;
                    s.y += s.dy;
                    if (s.x < 0) s.x = canvas.width;
                    if (s.x > canvas.width) s.x = 0;
                    if (s.y < 0) s.y = canvas.height;
                    if (s.y > canvas.height) s.y = 0;

                    ctx.beginPath();
                    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
                    ctx.fill();
                }
                animationId = requestAnimationFrame(animate);
            }
            animate();

            onBeforeUnmount(() => {
                cancelAnimationFrame(animationId);
                window.removeEventListener("resize", resize);
            });
        });

        return {
            select_game,
            loadCSV,
            showOverlay,
            parsedCSV,
            years,
            year,
            platforms,
            platform,
            search,
            igdb,
            selected_game_row,
            selected_game_image,
            star_canvas
        };
    }
}).mount('body');
