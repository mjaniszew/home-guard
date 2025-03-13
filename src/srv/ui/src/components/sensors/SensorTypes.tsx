import SensorsIcon from '@mui/icons-material/Sensors';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import FloodIcon from '@mui/icons-material/Flood';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';

import { 
  SENSOR_TYPES,
  SensorReadingResponse
} from '../../api/sensors';

export const SensorTypeIcons = {
  [SENSOR_TYPES.TEMPERATURE]: <DeviceThermostatIcon />,
  [SENSOR_TYPES.HUMIDITY]: <WaterDropIcon />,
  [SENSOR_TYPES.MOTION]: <DirectionsRunIcon />,
  [SENSOR_TYPES.FLOOD]: <FloodIcon />,
  [SENSOR_TYPES.OTHER_NUMERICAL_MEASURE]: <SensorsIcon />,
  [SENSOR_TYPES.OTHER_TEXT_MEASURE]: <SensorsIcon />
}

export const SensorTypeUnits = {
  [SENSOR_TYPES.TEMPERATURE]: "℃",
  [SENSOR_TYPES.HUMIDITY]: "%",
  [SENSOR_TYPES.MOTION]: "",
  [SENSOR_TYPES.FLOOD]: "",
  [SENSOR_TYPES.OTHER_NUMERICAL_MEASURE]: "",
  [SENSOR_TYPES.OTHER_TEXT_MEASURE]: ""
}

enum SENSOR_STATE_COLORS {
  DEFAULT = 'default',
  ERROR = 'error'
}

export const getSensorIcon = (sensorType: SENSOR_TYPES) => {
  return SensorTypeIcons[sensorType];
};

export const getSensorUnit = (sensorType: SENSOR_TYPES) => {
  return SensorTypeUnits[sensorType];
};

export const formatSensorValue = (value: string, sensorType: SENSOR_TYPES) => {
  let formattedValue;

  if (sensorType ===  SENSOR_TYPES.HUMIDITY) {
    formattedValue = `${Number(value).toFixed(0)} ${getSensorUnit(sensorType)}`;
  } else if (
    sensorType === SENSOR_TYPES.TEMPERATURE ||
    sensorType ===  SENSOR_TYPES.OTHER_NUMERICAL_MEASURE
  ) {
    formattedValue = `${Number(value).toFixed(1)} ${getSensorUnit(sensorType)}`;
  } else {
    formattedValue = `${value} ${getSensorUnit(sensorType)}`;
  }

  return formattedValue;
};

export const getSensorStateColor = (value: string, sensorType: SENSOR_TYPES): SENSOR_STATE_COLORS => {
  let sensorStateColor = SENSOR_STATE_COLORS.DEFAULT;

  if (sensorType ===  SENSOR_TYPES.FLOOD && value === 'ALERT') {
    sensorStateColor = SENSOR_STATE_COLORS.ERROR;
  }

  return sensorStateColor;
};

export const sensorHasRecentReading = (reading: SensorReadingResponse): boolean => {
  const offlineTresholdMs = 13 * 60 * 60 * 1000; // 6 hours treshold
  return (reading?.timestamp || 0) + offlineTresholdMs >= Date.now();
}