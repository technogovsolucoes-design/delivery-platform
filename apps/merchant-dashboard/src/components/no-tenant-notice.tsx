export function NoTenantNotice() {
  return (
    <div className="card" style={{ maxWidth: 480 }}>
      <p style={{ margin: 0 }}>
        Sua conta ainda não está vinculada a nenhuma loja. Rode o script de seed (ou peça para um
        admin da plataforma) para definir os custom claims <code>role</code> e{" "}
        <code>tenantId</code> da sua conta.
      </p>
    </div>
  );
}
