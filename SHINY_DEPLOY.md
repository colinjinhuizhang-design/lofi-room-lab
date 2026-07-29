# Shiny Publishing

This project can be hosted as a Shiny app.

The wrappers serve the existing browser app full-screen and expose local static assets from the project root, including `index.html`, `styles.css`, `app.js`, `engine.js`, `node_modules/lamejs`, and the MP3 files in `assets/tracks`.

## shinyapps.io

Use the R Shiny wrapper in `app.R`. This is the safest target for shinyapps.io.

Local run from R:

```r
shiny::runApp(".")
```

Deploy after configuring the token from your shinyapps.io dashboard:

```r
rsconnect::deployApp(appDir = ".", appName = "lofi-room-lab")
```

## Python Shiny

The `app.py` wrapper is also available for Shiny for Python compatible hosting.

```powershell
python -m pip install -r requirements.txt
shiny run app.py
```
