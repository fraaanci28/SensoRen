# SensoRen - Monitor de Parámetros Fisiológicos para Pacientes con Enfermedad Renal Crónica

Este proyecto forma parte del trabajo final de la asignatura **Tecnologías para e-Health** del Máster en Ingeniería Biomédica y Salud Digital. El objetivo es diseñar e implementar una aplicación que simule la monitorización de parámetros fisiológicos relevantes para pacientes con enfermedad renal crónica (ERC), como la Glomerulonefritis IgA.

## Funcionalidades implementadas

- Visualización de parámetros fisiológicos simulados:
  - Tensión arterial (sistólica y diastólica)
  - Glucosa en sangre
  - Frecuencia cardíaca
  - Número de pasos diarios
  - Hidratación
  - Peso corporal
- Cálculo de medias para cada parámetro.
- Detección de valores fuera de rango y generación de alertas visuales.
- Interfaz gráfica con gráficas animadas y tarjetas informativas.
- Estado clínico general del paciente.
- (Pendiente de añadir) Registro manual de medicación.

## Simulación de datos

Los datos se cargan desde un archivo local llamado `datos_sensoRen.json`, que simula la entrada de datos desde un dispositivo médico o plataforma de simulación. El formato del archivo es el siguiente:

```json
{
  "glucosa": [
    { "timestamp": "2025-07-01T08:00:00", "valor": 95 },
    ...
  ],
  "frecuencia_cardiaca": [{
      "timestamp": "2025-07-01T07:00:00",
      "valor": 70
    },
     ...
  ],
  "pasos": [{
      "timestamp": "2025-07-01T08:00:00",
      "valor": 1188
    },
     ...
  ],
  "hidratacion": [{
      "timestamp": "2025-07-01T06:00:00",
      "valor": 59
    },
     ...
  ],
  "peso": [{
      "timestamp": "2025-07-01T08:00:00",
      "valor": 68.7
    },
     ...
  ],
  "tension": [
    { "timestamp": "2025-07-01T08:00:00", "sistolica": 125, "diastolica": 78 },
    ...
  ]
}
