install.packages(
  c(
    "jsonlite",
    "remotes"
  ), 
  repos = "https://cloud.r-project.org/"
)

remotes::install_github("cran/SEER2R", ref="1.0")
remotes::install_github("cran/RecurRisk", ref="1.0.2")