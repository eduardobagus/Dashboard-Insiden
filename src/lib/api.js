export async function fetchIncidents() {
  const response = await fetch('/api/incidents');
  if (!response.ok) {
    throw new Error('Failed to fetch incidents');
  }
  return response.json();
}

export async function createIncident(data) {
  const response = await fetch('/api/incidents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create incident');
  }
  return response.json();
}

export async function updateIncident(id, data) {
  const response = await fetch(`/api/incidents/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update incident');
  }
  return response.json();
}

export async function deleteIncident(id) {
  const response = await fetch(`/api/incidents/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete incident');
  }
  return response.json();
}

export async function seedIncidents(seedData) {
  const response = await fetch('/api/seed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(seedData),
  });
  if (!response.ok) {
    throw new Error('Failed to seed incidents');
  }
  return response.json();
}
