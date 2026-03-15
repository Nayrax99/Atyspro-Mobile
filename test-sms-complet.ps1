# ============================================
# Tests SMS Qualification + Relances
# ============================================

$baseUrl = "http://localhost:3000"
$numeroProTwilio = "+33612345678"

Write-Host "`nDÉMARRAGE DES TESTS SMS V1`n" -ForegroundColor Cyan

# ============================================
# TEST 1: Appel manqué -> SMS qualification
# ============================================

Write-Host "TEST 1: Appel manqué (no-answer)" -ForegroundColor Yellow

$voiceParams = @{
    CallSid = "CA_TEST_001"
    CallStatus = "no-answer"
    From = "+33601020304"
    To = $numeroProTwilio
    Direction = "inbound"
}

Invoke-RestMethod `
    -Uri "$baseUrl/api/webhooks/twilio/voice" `
    -Method POST `
    -ContentType "application/x-www-form-urlencoded" `
    -Body $voiceParams | Out-Null

Write-Host "Appel manqué traité" -ForegroundColor Green
Write-Host "Vérifie les logs Next.js" -ForegroundColor Cyan
Write-Host ""

Start-Sleep -Seconds 2

# ============================================
# TEST 2: SMS exploitable -> pas de relance
# ============================================

Write-Host "TEST 2: SMS exploitable" -ForegroundColor Yellow

$smsExploitable = @{
    From = "+33601020304"
    To = $numeroProTwilio
    Body = "1 / 2 / 12 rue Victor Hugo 75015 Paris / Jean Dupont / Panne totale"
    MessageSid = "SM_EXPLOIT_001"
}

$response = Invoke-RestMethod `
    -Uri "$baseUrl/api/webhooks/twilio/sms" `
    -Method POST `
    -ContentType "application/x-www-form-urlencoded" `
    -Body $smsExploitable

Write-Host "Lead créé:" -ForegroundColor Green
Write-Host "  - Type: $($response.parsed.type_code) (Dépannage)" -ForegroundColor Gray
Write-Host "  - Délai: $($response.parsed.delay_code) (48h)" -ForegroundColor Gray
Write-Host "  - Status: $($response.parsed.lead_status)" -ForegroundColor Gray
Write-Host "  - Score: $($response.scored.priority_score)" -ForegroundColor Gray
Write-Host "Aucune relance ne doit être envoyée" -ForegroundColor Cyan
Write-Host ""

Start-Sleep -Seconds 2

# ============================================
# TEST 3: SMS inexploitable -> relance correction (1ère fois)
# ============================================

Write-Host "TEST 3: SMS inexploitable (relance 1)" -ForegroundColor Yellow

# D'abord créer un appel manqué pour ce numéro
$voiceParams2 = @{
    CallSid = "CA_TEST_002"
    CallStatus = "no-answer"
    From = "+33602030405"
    To = $numeroProTwilio
    Direction = "inbound"
}

Invoke-RestMethod `
    -Uri "$baseUrl/api/webhooks/twilio/voice" `
    -Method POST `
    -ContentType "application/x-www-form-urlencoded" `
    -Body $voiceParams2 | Out-Null

Start-Sleep -Seconds 1

# Ensuite SMS inexploitable
$smsInexploitable1 = @{
    From = "+33602030405"
    To = $numeroProTwilio
    Body = "Bonjour"
    MessageSid = "SM_INEXPLOIT_001"
}

Invoke-RestMethod `
    -Uri "$baseUrl/api/webhooks/twilio/sms" `
    -Method POST `
    -ContentType "application/x-www-form-urlencoded" `
    -Body $smsInexploitable1 | Out-Null

Write-Host "Relance correction envoyée (relance_count = 1)" -ForegroundColor Green
Write-Host "Vérifie les logs -> SMS de correction simulé" -ForegroundColor Cyan
Write-Host ""

Start-Sleep -Seconds 2

# ============================================
# TEST 4: 2ème SMS inexploitable -> pas de 3ème relance
# ============================================

Write-Host "TEST 4: 2ème SMS inexploitable (quota atteint)" -ForegroundColor Yellow

$smsInexploitable2 = @{
    From = "+33602030405"
    To = $numeroProTwilio
    Body = "Merci"
    MessageSid = "SM_INEXPLOIT_002"
}

Invoke-RestMethod `
    -Uri "$baseUrl/api/webhooks/twilio/sms" `
    -Method POST `
    -ContentType "application/x-www-form-urlencoded" `
    -Body $smsInexploitable2 | Out-Null

Write-Host "Lead mis en needs_review (relance_count = 2)" -ForegroundColor Green
Write-Host "Vérifie les logs -> AUCUN SMS supplémentaire" -ForegroundColor Cyan
Write-Host ""

# ============================================
# RÉSUMÉ
# ============================================

Write-Host "`n=======================================" -ForegroundColor Cyan
Write-Host "TESTS TERMINÉS" -ForegroundColor Green
Write-Host "=======================================`n" -ForegroundColor Cyan

Write-Host "VÉRIFICATIONS DANS SUPABASE:" -ForegroundColor Yellow
Write-Host "1. Table leads : 3 leads créés" -ForegroundColor White
Write-Host "2. Table sms_messages : plusieurs SMS outbound simulés" -ForegroundColor White
Write-Host "3. Lead +33602030405 : relance_count = 2, status = needs_review`n" -ForegroundColor White

Write-Host "VÉRIFICATIONS DANS LES LOGS NEXT.JS:" -ForegroundColor Yellow
Write-Host "1. Messages vocaux TwiML" -ForegroundColor White
Write-Host "2. SMS SIMULATION (DEV MODE)" -ForegroundColor White
Write-Host "3. Logs Relance correction pour test 3" -ForegroundColor White
Write-Host "4. Logs Quota atteint pour test 4`n" -ForegroundColor White