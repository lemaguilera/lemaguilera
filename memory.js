(() => {

    const gui = {
        game: document.querySelector(".game"),
        home: document.querySelector(".home"),
        level: document.querySelector(".level"),
        customLevel: document.querySelector(".custom-level"),
        board: document.querySelector(".board"),
        card: document.querySelector(".card"),
        score: document.querySelector(".score"),
        saving: document.querySelector(".saving"),
        ranking: document.querySelector(".rankingContainer"),
        topRanking: document.querySelector(".game .home .ranking"),
        allRanking: document.querySelector(".rankingContainer .ranking"),
        rankingBack: document.querySelector(".rankingContainer button")
    };

    const hdn = document.querySelector(".hidden");
    document.body.removeChild(hdn);

    const levels = {
        easy: {
            cols: 3,
            rows: 2
        },
        normal: {
            cols: 4,
            rows: 3
        },
        hard: {
            cols: 6,
            rows: 4
        }
    };

    const game = {
        level: {},
        gui: gui.home,
        cards: [],
        selStatus: 0,
        sel1: false,
        sel2: false,
        mistakes: 0,
        initTime: 0
    };

    gui.home.querySelector("button").addEventListener("click", () => {
        gui.game.removeChild(game.gui);
        game.gui = gui.level;
        gui.game.appendChild(gui.level);
    });

    Array.from(gui.level.children).forEach(child => {
        child.addEventListener("click", e => {
            const level = e.target.className;
            if (level in levels) {
                game.level = levels[level];
                renderBoard();
                return;
            }
            renderCustomLevel();
        });
    });
    const renderCustomLevel = () => {
        gui.game.removeChild(game.gui);
        const size = gui.game.getClientRects()[0];

        game.gui = gui.customLevel;
        gui.game.appendChild(gui.customLevel);
        renderBoard();
    };
    const renderBoard = () => {
        gui.game.removeChild(game.gui);

        game.cards.forEach(card => {
            removeEventListener("click", card.handler);
            gui.board.removeChild(card.element);
        });

        const totalx2 = game.level.cols * game.level.rows;
        const total = totalx2 / 2;
        let symbols = rnds(total, combinations(_chars, _colors));
        symbols = rnda([...symbols, ...symbols]);

        symbols.forEach((s, n) => {
            const row = Math.floor(n / game.level.cols);
            const col = n % game.level.cols;
            const element = getCard(s[0], s[1]);
            const hash = s.join("");
            const hashrc = s.join("") + col + "-" + row;
            gui.board.appendChild(element);
            game.cards.push({
                element,
                value: s,
                hash,
                hashrc,
                col,
                row,
                closed: true,
                handler: false
            });
        });

        game.cards.forEach(card => {
            card.handler = () => {
                if (game.selStatus === 0 && card.closed && game.sel1.hashrc !== card.hashrc) {
                    card.element.classList.remove("closed");
                    card.element.innerHTML = card.value[0];
                    card.element.style.color = card.value[1];
                    game.sel1 = card;
                    game.selStatus = 1;
                    return;
                }
                if (game.selStatus === 1 && card.closed && game.sel1.hashrc !== card.hashrc) {
                    game.selStatus = 2;
                    card.element.classList.remove("closed");
                    card.element.innerHTML = card.value[0];
                    card.element.style.color = card.value[1];
                    if (game.sel1.hash !== card.hash) {
                        setTimeout(() => {
                            game.sel1.element.classList.add("closed");
                            card.element.classList.add("closed");
                            game.sel1.element.innerHTML = "";
                            card.element.innerHTML = "";
                            card.element.style.color = "";
                            game.sel1.element.style.color = "";
                            game.selStatus = 0;
                        }, 2e3);
                        wrong();
                    } else {
                        game.sel1.closed = false;
                        card.closed = false;
                        game.selStatus = 0;
                        success();
                    }
                    return;
                }
            };
            card.element.addEventListener("click", card.handler);
        });

        gui.board.style.width = `${game.level.cols * 60}px`;

        game.gui = gui.board;
        gui.game.appendChild(gui.board);

        game.initTime = new Date().getTime();
        game.mistakes = 0;
    };

    const wrong = () => {
        gui.board.style.background = "#f009";
        game.mistakes++;
        setTimeout(() => {
            gui.board.style.background = "";
        }, 618);
    };
    const success = () => {
        gui.board.style.background = "#0f09";
        setTimeout(() => {
            gui.board.style.background = "";
        }, 618);

        const closed = game.cards.some(card => card.closed);
        if (!closed) renderScore();
    };

    const renderScore = () => {
        gui.game.removeChild(game.gui);

        const time = gui.score.querySelector(".time");
        const mistakes = gui.score.querySelector(".mistakes");
        const user = gui.score.querySelector("input");
        const save = gui.score.querySelector("button");

        const totalTime = new Date().getTime() - game.initTime;
        time.innerHTML = `Total time: ${Math.round(totalTime / 10) / 100}s`;
        mistakes.innerHTML = `Mistakes: ${game.mistakes}`;

        game.gui = gui.score;
        gui.game.appendChild(gui.score);

        save.addEventListener("click", () => {
            const alias = user.value.trim() === "" ? "anonymous" : user.value.trim();
            const dificulty = game.level.cols * game.level.rows;

            gui.game.removeChild(game.gui);
            game.gui = gui.saving;
            gui.game.appendChild(gui.saving);

            saveRank(alias, totalTime, game.mistakes, dificulty)
                .then(_ => {
                    gui.game.removeChild(game.gui);
                    game.gui = gui.home;
                    gui.game.appendChild(gui.home);
                    updateRanking();
                })
                .catch(_ => {
                    gui.game.removeChild(game.gui);
                    game.gui = gui.home;
                    gui.game.appendChild(gui.home);
                    updateRanking();
                })
                ;
        });
    };

    fetch(`memory.css?cb=${new Date().getTime()}`)
        .then(_ => _.text())
        .then(_ => {
            const css = document.createElement("style");
            css.innerHTML = _;
            document.head.appendChild(css);
        });


    let ranking = [];

    const updateRanking = async () => {
        const ranks = await getRanks();
        try {
            ranking = ranks
                .map(_ => {
                    delete _.rank;
                    delete _.date;
                    return _;
                })
                .sort((a, b) => {
                    if (a.dificulty < b.dificulty) return +1;
                    if (a.dificulty > b.dificulty) return -1;
                    if (a.time < b.time) return -1;
                    if (a.time > b.time) return +1;
                    if (a.mistakes < b.mistakes) return -1;
                    if (a.mistakes > b.mistakes) return +1;
                    return 0;
                });
            gui.allRanking.innerHTML = "<div class='header'><div>User</div><div>N°</div></div>";
            gui.topRanking.innerHTML = "<div class='header'><div>User</div><div>N°</div></div>";
            ranking.forEach((r, n) => {
                const row = document.createElement("div");
                row.classList.add("row");
                if (n === 0) row.classList.add("first");
                row.innerHTML = `
            <div class="user">
                <div class="alias">${r.alias}</div>
                <div class="dificulty">Cards: ${r.dificulty}</div>
                <div class="time">Time: ${Math.round(r.time / 10) / 100}s</div>
                <div class="mistakes">Mistakes: ${r.mistakes}</div>
            </div>
            <div class="rank">${n + 1}</div>
            `;
                gui.allRanking.appendChild(row);
                if (n < 5) gui.topRanking.appendChild(row.cloneNode(true));
            });
        } catch (e) {
            console["log"]("Error retrieving the rank history");
        }
    };

    updateRanking();

    gui.topRanking.addEventListener("click", () => {
        updateRanking();
        gui.game.removeChild(game.gui);
        game.gui = gui.ranking;
        gui.game.appendChild(game.gui);
    });

    gui.rankingBack.addEventListener("click", () => {
        gui.game.removeChild(game.gui);
        game.gui = gui.home;
        gui.game.appendChild(game.gui);
    });
})();
