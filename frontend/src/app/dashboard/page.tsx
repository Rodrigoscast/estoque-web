'use client';

import Layout from "@/components/Layout";
import withAuth from "@/components/hoc/withAuth";

function Dashboard() {
  return (
    <Layout>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Bem-vindo ao painel de controle!</p>
    </Layout>
  );
}

export default withAuth(Dashboard);
