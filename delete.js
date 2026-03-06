const fs = require('fs');
const paths = [
    'src/app/components/login',
    'src/app/components/register',
    'src/app/guards/auth.guard.ts',
    'src/app/interceptors/auth.interceptor.ts',
    'src/app/services/auth.service.ts',
    'src/app/services/user.service.ts'
];
for (const p of paths) {
    try {
        fs.rmSync(p, { recursive: true, force: true });
        console.log('Deleted ' + p);
    } catch (e) {
        console.error('Error deleting ' + p, e);
    }
}
