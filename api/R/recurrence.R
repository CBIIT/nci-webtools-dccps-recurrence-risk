# Title     : Script to interface with the recurrence package
# Objective :
# Created by:
# Created on: 9/18/18

#this will eventually be a compiled library
source("R/app_functions_Rconsole.R")
library(jsonlite)

methods <- c("handleGroupMetadata","handleIndividualMetadata",
  "handleRecurrenceRiskGroup", "handleRecurrenceRiskIndividual")

handleInterface <- function(args) {
  #cat("Handle interface called","\n", file = stdout())
  method = args$method
  stopifnot( exists("method"), match(method,methods) > 0 )
  args$method = NULL
  return(do.call(method,args))
}

handleGroupMetadata <- function(requestId,seerDictionaryFile,seerDataFile) {
  #cat("handleGroupMetadata() ",requestId,"\n", file = stdout())
  stopifnot(exists("seerDictionaryFile"),exists("seerDataFile"),
  file.exists(seerDictionaryFile),file.exists(seerDataFile))
  seerData = read.SeerStat(seerDictionaryFile,seerDataFile)
  seerVars = choices.stagevars(seerData)
  seerValues = if (length(seerVars) == 1) seerData[seerVars] else seerData[,seerVars]

  metadata = c()
  metadata$variables = seerVars
  metadata$values = lapply(seerValues,function(x) sort(unique(x)))
  metadata$maxFollowUp = maxfup.group(seerData)
  return(metadata)
}

handleIndividualMetadata <- function(requestId,seerCSVDataFile) {
  #cat("handleIndividualMetadata() ",requestId,"\n", file = stdout())
  stopifnot(exists("seerCSVDataFile"),file.exists(seerCSVDataFile))
  seerData = fread(seerCSVDataFile)
  seerVars = choices.vars(seerData)

  metadata = c()
  metadata$variables = seerVars
  metadata$values = lapply(seerData,function(x) sort(unique(x)))
  return(metadata)
}

handleRecurrenceRiskGroup <- function(requestId, seerDictionaryFile, seerDataFile, canSurvDataFile,
  stageVariable, stageValue, adjustmentFactor, yearsOfFollowUp, workingDirectory, mimeType) {
  #cat("handleRecurrenceRiskGroup() ",requestId,"\n", file = 'r.out.log',  append = T)
  stopifnot(exists("seerDictionaryFile"),exists("seerDataFile"),exists('canSurvDataFile'),
    file.exists(seerDictionaryFile),file.exists(seerDataFile),file.exists(canSurvDataFile))
  seerData = read.SeerStat(seerDictionaryFile,seerDataFile)
  canSurvData = read.csv(canSurvDataFile,stringsAsFactors=F,check.names=F)
  dataTable = recurrencerisk.group(seerData,canSurvData,stageVariable,stageValue,as.numeric(adjustmentFactor),
    as.numeric(yearsOfFollowUp))

  resultFilePath = "";

  if ( "text/csv" == mimeType ) {
    resultFilePath = file.path(workingDirectory,paste0(requestId,"_result.csv"))
    write.csv(dataTable,resultFilePath,row.names=FALSE)
  } else {
    resultFilePath = file.path(workingDirectory,paste0(requestId,"_result.json"))
    write_json(dataTable,resultFilePath,na = "string", digits = NA, auto_unbox = T, dataframe = "rows")
  }
  #cat("handleRecurrenceRiskGroup() ",resultFilePath,"\n", file = 'r.out.log',  append = T)
  return(resultFilePath)
}


handleRecurrenceRiskIndividual <- function(requestId, seerCSVDataFile, strata,
  covariates, timeVariable, eventVariable, distribution, stageVariable, distantStageValue,
  adjustmentFactor, yearsOfFollowUp, workingDirectory, mimeType) {
  #cat("handleRecurrenceRiskIndividual() ",requestId,"\n", file = 'r.out.log',  append = T)
  stopifnot(exists("seerCSVDataFile"),file.exists(seerCSVDataFile))
  seerData = fread(seerCSVDataFile)

  cstrata = unlist(strsplit(strata, ","))
  ccovariate = unlist(strsplit(covariates, ","))

  dataTable = recurrencerisk.individual(seerData,cstrata,ccovariate,timeVariable,eventVariable,stageVariable,
    distantStageValue,as.numeric(adjustmentFactor),distribution,as.numeric(yearsOfFollowUp))

  resultFilePath = "";

  if ( "text/csv" == mimeType ) {
    resultFilePath = file.path(workingDirectory,paste0(requestId,"_result.csv"))
    write.csv(dataTable,resultFilePath,row.names=FALSE)
  } else {
    resultFilePath = file.path(workingDirectory,paste0(requestId,"_result.json"))
    write_json(dataTable,resultFilePath,na = "string", digits = NA, auto_unbox = T, dataframe = "rows")
  }
  #cat("handleRecurrenceRiskIndividual() ",resultFilePath,"\n", file = 'r.out.log',  append = T)
  return(resultFilePath)
}

stopifnot(exists("input"))
args = input[[1]]
#cat("Interface: input exists","\n", file = stdout())
handleInterface(args)
