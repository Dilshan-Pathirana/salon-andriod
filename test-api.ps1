$ErrorActionPreference = "Continue"
$base = "http://localhost:3000/api/v1"

Write-Output "========================================="
Write-Output "  API Endpoint Tests"
Write-Output "========================================="

# 1. Login as Admin
Write-Output "`n--- 1. Login (Admin) ---"
try {
    $lr = Invoke-RestMethod -Uri "$base/auth/login" -Method POST -ContentType "application/json" -Body '{"phoneNumber":"0712345678","password":"admin12345"}'
    $token = $lr.data.accessToken
    $headers = @{Authorization="Bearer $token"}
    Write-Output "SUCCESS: Logged in as $($lr.data.user.firstName) $($lr.data.user.lastName) ($($lr.data.user.role))"
} catch {
    Write-Output "FAILED: $($_.Exception.Message)"
    exit 1
}

# 2. Get Profile
Write-Output "`n--- 2. Get Profile ---"
try {
    $profile = Invoke-RestMethod -Uri "$base/users/profile" -Headers $headers
    Write-Output "SUCCESS: $($profile.data.firstName) $($profile.data.lastName) - $($profile.data.phoneNumber)"
} catch {
    Write-Output "FAILED: $($_.Exception.Message)"
}

# 3. Get All Users (Admin)
Write-Output "`n--- 3. Get All Users ---"
try {
    $users = Invoke-RestMethod -Uri "$base/users" -Headers $headers
    Write-Output "SUCCESS: $($users.data.Count) users found"
    foreach ($u in $users.data) {
        Write-Output "  - $($u.firstName) $($u.lastName) ($($u.role))"
    }
} catch {
    Write-Output "FAILED: $($_.Exception.Message)"
}

# 4. Get Today's Schedule
Write-Output "`n--- 4. Get Schedule (today) ---"
$today = (Get-Date).ToString("yyyy-MM-dd")
try {
    $sched = Invoke-RestMethod -Uri "$base/schedule/$today" -Headers $headers
    Write-Output "SUCCESS: $($sched.message)"
    if ($sched.data) {
        Write-Output "  isOpen: $($sched.data.isOpen), slots: $($sched.data.slots)"
    }
} catch {
    Write-Output "FAILED: $($_.Exception.Message)"
}

# 5. Get Schedule Range
Write-Output "`n--- 5. Get Schedule Range ---"
$end = (Get-Date).AddDays(7).ToString("yyyy-MM-dd")
try {
    $range = Invoke-RestMethod -Uri "$base/schedule?startDate=$today&endDate=$end" -Headers $headers
    Write-Output "SUCCESS: $($range.data.Count) days in range"
} catch {
    Write-Output "FAILED: $($_.Exception.Message)"
}

# 6. Get Current Session
Write-Output "`n--- 6. Get Current Session ---"
try {
    $session = Invoke-RestMethod -Uri "$base/session/current" -Headers $headers
    Write-Output "SUCCESS: $($session.message)"
    if ($session.data) {
        Write-Output "  Session ID: $($session.data.id), status: $($session.data.status)"
    }
} catch {
    Write-Output "FAILED: $($_.Exception.Message)"
}

# 7. Get Queue
Write-Output "`n--- 7. Get Queue ---"
try {
    $queue = Invoke-RestMethod -Uri "$base/queue" -Headers $headers
    Write-Output "SUCCESS: $($queue.message)"
    Write-Output "  Queue items: $($queue.data.Count)"
} catch {
    Write-Output "FAILED: $($_.Exception.Message)"
}

# 8. Get Appointments
Write-Output "`n--- 8. Get Appointments ---"
try {
    $appts = Invoke-RestMethod -Uri "$base/appointments" -Headers $headers
    Write-Output "SUCCESS: $($appts.message)"
    Write-Output "  Appointments: $($appts.data.Count)"
    foreach ($a in $appts.data) {
        Write-Output "  - $($a.clientName) @ $($a.slotTime) ($($a.status))"
    }
} catch {
    Write-Output "FAILED: $($_.Exception.Message)"
}

# 9. Login as Client
Write-Output "`n--- 9. Login (Client) ---"
try {
    $clr = Invoke-RestMethod -Uri "$base/auth/login" -Method POST -ContentType "application/json" -Body '{"phoneNumber":"0771234567","password":"client12345"}'
    $ctoken = $clr.data.accessToken
    $cheaders = @{Authorization="Bearer $ctoken"}
    Write-Output "SUCCESS: Logged in as $($clr.data.user.firstName) $($clr.data.user.lastName) ($($clr.data.user.role))"
} catch {
    Write-Output "FAILED: $($_.Exception.Message)"
}

# 10. Client Get My Appointments
Write-Output "`n--- 10. Client - My Appointments ---"
try {
    $myappts = Invoke-RestMethod -Uri "$base/appointments/my" -Headers $cheaders
    Write-Output "SUCCESS: $($myappts.message)"
    Write-Output "  My appointments: $($myappts.data.Count)"
} catch {
    Write-Output "FAILED: $($_.Exception.Message)"
}

Write-Output "`n========================================="
Write-Output "  Tests Complete"
Write-Output "========================================="
