const MODEL = {
  "features": [
    "smoking_former",
    "smoking_current",
    "alcohol_consumption_per_week",
    "physical_activity_minutes_per_week",
    "diet_score",
    "sleep_hours_per_day",
    "screen_time_hours_per_day"
  ],
  "coefficients": [
    0.0012138526557888341,
    0.0017833685293771166,
    0.0010747585923089335,
    -0.2046540802097735,
    -0.0921445269683404,
    -0.001812152943164593,
    0.03783000009230646
  ],
  "intercept": 0.4095744224222167,
  "means": [
    0.20011,
    0.20176,
    2.00367,
    118.91164,
    5.994787,
    6.997818,
    5.996467999999999
  ],
  "stds": [
    0.4000824763720601,
    0.4013139698540284,
    1.417771678056802,
    84.4092404450508,
    1.780945401923091,
    1.0946169370496694,
    2.468393713526268
  ]
};

function predictRisk(smokingStatus, alcohol, activity, diet, sleep, screenTime) {

  // convert smoking category to the two binary columns
  // smokingStatus is 'never', 'former', or 'current'
  const smokingFormer  = smokingStatus === 'former'  ? 1 : 0;
  const smokingCurrent = smokingStatus === 'current' ? 1 : 0;

  // must match the order of FEATURES in Python exactly
  const raw = [
    smokingFormer,
    smokingCurrent,
    alcohol,
    activity,
    diet,
    sleep,
    screenTime,
  ];

  // standardise using training means and stds
  const scaled = raw.map((v, i) =>
    (v - MODEL.means[i]) / MODEL.stds[i]
  );

  // logit then sigmoid
  const logit = MODEL.intercept +
    scaled.reduce((sum, v, i) => sum + v * MODEL.coefficients[i], 0);

  return 1 / (1 + Math.exp(-logit));   // probability 0–1
}
