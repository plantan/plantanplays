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

        let animationId;
        onMounted(() => {
            function set_banner_height() {
                const banner = document.getElementById('banner');
                document.documentElement.style.setProperty("--banner-height", banner.height + 'px');
            }

            const canvas = document.getElementById('star-canvas');
            function resize_star_canvas() {
                canvas.width = window.innerWidth;
                canvas.height = document.getElementById('banner').height;
            }

            function make_stars() {
                const starCount = window.innerWidth * 0.1;
                return Array.from({ length: starCount }, () => ({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    r: Math.max(1, Math.random() * canvas.height * 0.004),
                    alpha: Math.random(),
                    blinkSpeed: Math.random() * 0.005 + 0.005,
                    dx: (Math.random() - 0.5) * 0.1,
                    dy: (Math.random() - 0.5) * 0.1,
                }));
            }

            let stars = [{}];
            function resize() {
                set_banner_height();
                resize_star_canvas();
                stars = make_stars()
            }

            window.addEventListener("load", () => { resize(); });
            window.addEventListener("resize", () => { resize(); });

            const ctx = canvas.getContext("2d");
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
            selected_game_image
        };
    }
}).mount('body');
