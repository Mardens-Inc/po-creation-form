if (-not $env:MARDENS_SSH_HOST)
{
    throw "Environment variable MARDENS_SSH_HOST is not set"
}

if (-not $env:MARDENS_SSH_KEY_PATH)
{
    throw "Environment variable MARDENS_SSH_KEY_PATH is not set"
}

pwp -H "$env:MARDENS_SSH_HOST" -u administrator -a "$env:MARDENS_SSH_KEY_PATH" -s po_tracker_dashboard --binary po_tracker_dashboard -BSc "npm run build"