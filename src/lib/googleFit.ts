export async function fetchGoogleFitData(accessToken: string) {
  const endTime = new Date();
  const startTime = new Date();
  startTime.setDate(startTime.getDate() - 7); // Last 7 days

  const body = {
    aggregateBy: [
      {
        dataTypeName: 'com.google.sleep.segment',
      },
      {
        dataTypeName: 'com.google.heart_rate.bpm',
      }
    ],
    bucketByTime: { durationMillis: 86400000 },
    startTimeMillis: startTime.getTime(),
    endTimeMillis: endTime.getTime(),
  };

  try {
    const response = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Google Fit API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Error fetching Google Fit data:', err);
    throw err;
  }
}
