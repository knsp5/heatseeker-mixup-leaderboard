function getGradientColor(value, min, max) {
    const light = { r: 255, g: 255, b: 255 };
    const dark = { r: 87, g: 187, b: 138 };

    const percent = (value - min) / (max - min || 1);

    const r = Math.round(light.r + percent * (dark.r - light.r));
    const g = Math.round(light.g + percent * (dark.g - light.g));
    const b = Math.round(light.b + percent * (dark.b - light.b));

    return `rgb(${r}, ${g}, ${b})`;
}

function loadLeaderboard() {
    const sheetUrl =
        "https://docs.google.com/spreadsheets/d/1ysuS6dBHzL3QQlTrCZ_gApStModZPwUD/export?format=csv&gid=2147242592";

    const slotColors = [
        "#e39898",
        "#ffffb6",
        "#b7ffb7",
        "#ffdbb6",
        "#efbfbf",
        "#b7b7ff"
    ];

    fetch(sheetUrl + "&cacheBust=" + Date.now(), {
        cache: "no-store"
    })
        .then(response => response.text())
        .then(data => {
            let rows = data.split("\n");

            let playerColors = {};

            for (let rowNumber = 2; rowNumber <= 7; rowNumber++) {
                let cells = rows[rowNumber].split(",");
                let playerName = cells[1];

                playerColors[playerName] = slotColors[rowNumber - 2];
            }

            let allWins = [];

            for (let rowNumber = 15; rowNumber <= 20; rowNumber++) {
                let cells = rows[rowNumber].split(",");
                allWins.push(Number(cells[4]));
            }

            let maxWins = Math.max(...allWins);
            let minWins = Math.min(...allWins);

            let maxDiffAmongLeaders = -Infinity;

            for (let rowNumber = 15; rowNumber <= 20; rowNumber++) {
                let cells = rows[rowNumber].split(",");

                let wins = Number(cells[4]);
                let diff = Number(cells[5]);

                if (wins === maxWins) {
                    maxDiffAmongLeaders = Math.max(maxDiffAmongLeaders, diff);
                }
            }

            let tableRows = "";

            for (let rowNumber = 15; rowNumber <= 20; rowNumber++) {
                let cells = rows[rowNumber].split(",");

                let rank = cells[2];
                let player = cells[3];
                let wins = Number(cells[4]);
                let diff = Number(cells[5]);

                let rankStyle =
                    rank == "1"
                        ? "background:#f4b400;color:white;font-style:italic;"
                    : rank == "2"
                        ? "background:#b7b7b7;color:white;"
                    : "background:#43484d;color:white;";

                let playerColor = playerColors[player] || "white";

                let winsColor = getGradientColor(
                    wins,
                    minWins,
                    maxWins
                );

                let winsStyle =
                    wins === maxWins &&
                    diff === maxDiffAmongLeaders
                        ? "font-style: italic; font-weight: bold;"
                        : "";

                tableRows += `
                    <tr>
                        <td style="${rankStyle}; font-weight: normal;">
                            ${rank}
                        </td>

                        <td style="color:${playerColor}; font-weight: bold;">
                            ${player}
                        </td>

                        <td style="background-color:${winsColor}; color:black; ${winsStyle}">
                            ${wins}
                        </td>

                        <td style="font-weight: normal;">
                            ${diff}
                        </td>
                    </tr>
                `;
            }

            let headerCells = rows[14].split(",");
            let playerHeader = headerCells[3];
            let winsHeader = headerCells[4];

            document.getElementById("leaderboard").innerHTML = `
                <table>
                    <tr class="header-row">
                        <td>#</td>
                        <td>${playerHeader}</td>
                        <td>${winsHeader}</td>
                        <td>Diff</td>
                    </tr>

                    ${tableRows}
                </table>
            `;
        });
}

loadLeaderboard();
setInterval(loadLeaderboard, 1000);