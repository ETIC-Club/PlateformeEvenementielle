// TODO(ui): implémenter — menu latéral responsive (tiroir sur mobile) avec l'utilisateur connecté,
// son rôle et un bouton de déconnexion (POST /api/auth/logout puis redirection vers /login).
//
// Entrées du menu (le rôle autorisé vient de PAGE_ACCESS, src/lib/routes.ts : ne pas le recopier) :
//   Tableau de bord  /dashboard  LayoutDashboard  admin
//   Événements       /events     CalendarDays      admin   (participants, sessions et QR & badges sont des onglets d'un événement)
//   Scan             /scan       ScanLine          admin, agent
//   Comptes          /users      UserCog           admin
// L'agent ne voit donc que « Scan ». Entrée active : l'URL est la route ou commence par « route/ ».
export {};
