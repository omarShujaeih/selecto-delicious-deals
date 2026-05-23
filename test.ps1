$envFile = Get-Content ".env"
$supabaseUrl = ""
$supabaseKey = ""

foreach ($line in $envFile) {
    if ($line -match '^VITE_SUPABASE_URL="?(.*?)"?$') { $supabaseUrl = $matches[1] }
    if ($line -match '^VITE_SUPABASE_ANON_KEY="?(.*?)"?$') { $supabaseKey = $matches[1] }
}

$loginBody = @{
    email = "omar@example.com"
    password = "OmarSelecto2026"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$supabaseUrl/auth/v1/token?grant_type=password" -Method Post -Body $loginBody -Headers @{
    "apikey" = $supabaseKey
    "Content-Type" = "application/json"
}

$token = $loginResponse.access_token
$userId = $loginResponse.user.id

Write-Output "User ID: $userId"

$rolesResponse = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/user_roles?user_id=eq.$userId" -Method Get -Headers @{
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $token"
}

Write-Output "User Roles:"
$rolesResponse | ConvertTo-Json -Depth 10
