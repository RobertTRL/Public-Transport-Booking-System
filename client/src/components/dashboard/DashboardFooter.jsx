function DashboardFooter() {
  return (
    <footer className="border-t px-6 py-4 text-center text-sm text-muted-foreground">
      © {new Date().getFullYear()} Public Transport booking system. All rights reserved.
    </footer>
  );
}

export default DashboardFooter;
