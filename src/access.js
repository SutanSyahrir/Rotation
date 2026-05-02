export const ACCESS_SESSION_KEY = 'rotation-access-session';

export const allowedUsers = [
  {
    name: 'bendahara',
    passwordHash: 'b4948ebba888afe4e6d6da8927475ef01083d63f83386d0e3d37a99e92312fe7',
  },
];

async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function verifyAccess(name, password) {
  const normalizedName = name.trim().toLowerCase();
  const user = allowedUsers.find((entry) => entry.name === normalizedName);

  if (!user) {
    return false;
  }

  const passwordHash = await sha256(password);
  return passwordHash === user.passwordHash;
}
