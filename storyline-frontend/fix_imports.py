import re

path = 'src/features/events/EventDetailsDashboard.tsx'
with open(path, 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace(
    "import { eventsApi, financeApi } from '../../api/client';",
    "import api, { eventsApi, financeApi, usersApi, vendorsApi, inventoryApi, tasksApi, vendorAssignmentsApi, teamAssignmentsApi } from '../../api/client';"
)

code = re.sub(r'\s*const\s*\{[^}]+\}\s*=\s*await\s*import\([^)]+\);', '', code)

with open(path, 'w', encoding='utf-8') as f:
    f.write(code)

print("Fixed")
