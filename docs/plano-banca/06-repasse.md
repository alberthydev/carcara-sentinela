# Demonstração de bancada — roteiro de cinco minutos

Abra a seção **Demonstração para a banca** em [apresentacao.md](../../apresentacao.md).
As imagens permitem apresentar toda a sequência mesmo com os serviços parados.

## Sequência de apresentação

| Tempo | Mostre | Resultado a anunciar |
| --- | --- | --- |
| 0:00–0:45 | A captura diurna e o recorte ampliado | «Aqui usamos pesos YOLO reais em um clipe composto. O OCR leu a placa fictícia ABC1234.» |
| 0:45–2:00 | No painel Segurança, abra **Ferramentas Dev** e envie `dia.avi`. No cartão **Atendimento atual**, confira o recorte e escolha **Registrar entrada** | «O upload pede confirmação. Só a ação da portaria adicionou esta entrada manual ao histórico.» |
| 2:00–2:45 | A imagem da pessoa segurando uma placa | «As detecções deste caso são simuladas. O rastreador recebeu uma placa sem veículo, produziu zero eventos e o histórico continuou com um acesso.» |
| 2:45–3:45 | A imagem de duas passagens, os dois envios e o reenvio | «A API gravou as entradas simuladas de ABC1D23 e DEF1G23. Com o reenvio, o histórico continuou com três registros no total.» |
| 3:45–5:00 | A imagem do clipe com tremor e compressão, dados de velocidade e os estados de retomada do RTSP | «O detector encontrou o recorte no clipe difícil, mas o OCR não validou a placa. O stream RTSP local passou de conectado a reconectando e voltou a conectado. A validação no campus está pendente.» |

Mostre a imagem do cartão de revisão se o worker falhar. Se o app e a API
estiverem disponíveis, envie `revisao.json` para repetir o mesmo fluxo do
painel. Use a captura do histórico se o MongoDB estiver indisponível.
Os resultados da retomada estão no [repasse RTSP](03-repasse.md).

## Preparação local

Os comandos partem da raiz em PowerShell 7. Instale as dependências do
repositório. Prepare os clipes com `benchmark_fixture.py` e configure os
pesos documentados no [repasse da etapa 01](01-repasse.md). Mantenha
`VISION_DETECTOR=yolo`, `VISION_VEHICLE_MODEL` e `VISION_PLATE_MODEL`
configurados no ambiente. Se o Tesseract estiver fora do PATH, use
`TESSERACT_CMD` com o caminho do executável.

```powershell
python vision-worker/demo_banca.py .stage01-local/clips .stage01-local/demo-banca
$env:VITE_VISION_WORKER_URL = 'http://127.0.0.1:8300'
Push-Location app
npm run build
Pop-Location

docker run --rm -d --name carcara-demo-banca-mongo -p 127.0.0.1:33317:27017 mongo:5.0
$env:DEMO_MONGO_URI = 'mongodb://127.0.0.1:33317'
$env:DEMO_PASSWORD = Read-Host 'Senha descartavel para a banca' -MaskInput
$env:VISION_INGEST_TOKEN = [Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
$apiDemo = Start-Job -WorkingDirectory (Join-Path $PWD 'api') {
    npm exec -- tsx tests/demo-banca.ts
}

$env:VISION_HOST = '127.0.0.1'
$env:VISION_PORT = '8300'
$env:CORS_ORIGIN = 'http://127.0.0.1:3300'
$env:VISION_RTSP_ENABLED = 'false'
$workerDemo = Start-Job -WorkingDirectory $PWD {
    python -u vision-worker/server.py
}
```

Abra `http://127.0.0.1:3300/login`, use o CPF fictício `000.000.000-00`
e a senha descartável. No **Menu do Usuário**, passe o mouse em
**Alternar Papel (Dev)** e selecione **Segurança**. O banco nasce em Layer 2.
A porta do worker pode ser conferida em `http://127.0.0.1:8300/health`.
`Receive-Job $apiDemo -Keep` e `Receive-Job $workerDemo -Keep` mostram a
saída de cada serviço. Mantenha as credenciais fora da tela projetada.

Depois da entrada manual, envie os resultados do rastreador simulado em uma
janela de apoio. A placa do pedestre produziu uma lista vazia, então
nenhum POST é enviado no caso negativo.

```powershell
$headersDemo = @{ Authorization = ('Bearer ' + $env:VISION_INGEST_TOKEN) }
$endpointDemo = 'http://127.0.0.1:3300/api/users/visao/passagem'
$cenasDemo = 'entrada-um.json', 'entrada-dois.json', 'entrada-um.json'
foreach ($cenaDemo in $cenasDemo) {
    $eventoDemo = Get-Content (Join-Path '.stage01-local/demo-banca' $cenaDemo) -Raw
    Invoke-RestMethod -Method Post -Uri $endpointDemo -Headers $headersDemo `
        -ContentType 'application/json' -Body $eventoDemo |
        Select-Object placa, status, repetido
}
Get-Content .stage01-local/demo-banca/pedestre.json
```

Espere `repetido` igual a `false`, `false` e `true`, nessa ordem.
Atualize o painel e selecione **Segurança** novamente para mostrar os três
registros. Para repetir a apresentação com histórico vazio, encerre os
serviços e inicie a bancada de novo.

```powershell
Stop-Job $workerDemo, $apiDemo
docker stop carcara-demo-banca-mongo
Remove-Item Env:VISION_INGEST_TOKEN, Env:DEMO_PASSWORD
```

## Ensaio e material de apoio

- O gerador executou YOLO e Tesseract no clipe diurno e no clipe difícil.
  O dia retornou `ABC1234`. No clipe com compressão e tremor simulados, a
  placa foi localizada e ficou sem leitura válida.
- No Edge, o ensaio abriu o app real, enviou o vídeo ao worker e confirmou a
  entrada manual no painel. A API recebeu as duas decisões simuladas,
  marcou o reenvio como repetido e retornou três registros na consulta ao
  MongoDB. A contingência `revisao.json` passou no mesmo painel com
  `/process` bloqueado. As capturas do cartão e do histórico vêm desse
  ensaio. O build do app e o type-check da API e do script de bancada passaram.
- As figuras do pedestre e dos veículos ilustram detecções simuladas. Os
  recortes são saídas reais dos modelos sobre clipes de bancada. Nenhuma
  captura mostra senha, token ou placa real. A imagem de origem dos clipes
  é de Rudolf Stricker, com licença de atribuição. As figuras foram
  reduzidas, receberam placas fictícias e caixas de detecção.
  [Foto original e licença](https://commons.wikimedia.org/wiki/File:Fiat_500_front_20080621.jpg).
