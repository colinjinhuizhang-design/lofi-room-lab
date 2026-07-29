library(shiny)


addResourcePath("static", getwd())

ui <- fluidPage(
  tags$head(
    tags$title("Lo-Fi Room Lab"),
    tags$style(
      HTML(
        "
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
        "
      )
    )
  ),
  tags$iframe(
    src = "static/index.html",
    title = "Lo-Fi Room Lab",
    class = "lofi-app-frame",
    allow = "autoplay"
  )
)

server <- function(input, output, session) {
}

shinyApp(ui, server)
