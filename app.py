from pathlib import Path

from shiny import App, ui


ROOT = Path(__file__).parent

app_ui = ui.page_fluid(
    ui.tags.style(
        """
        html,
        body,
        .container-fluid {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
            background: #080511;
        }

        .lofi-app-frame {
            position: fixed;
            inset: 0;
            width: 100%;
            height: 100%;
            border: 0;
            display: block;
            background: #080511;
        }
        """
    ),
    ui.tags.iframe(
        src="index.html",
        title="Lo-Fi Room Lab",
        class_="lofi-app-frame",
        allow="autoplay",
    ),
)


def server(input, output, session):
    pass


app = App(app_ui, server, static_assets=str(ROOT))
