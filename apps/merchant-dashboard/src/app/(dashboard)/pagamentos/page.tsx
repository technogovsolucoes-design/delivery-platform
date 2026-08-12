export default function PagamentosPage() {
  return (
    <div>
      <div className="page-header">
        <p className="eyebrow">Gestão</p>
        <h1>Pagamentos</h1>
        <p>Extrato de repasses e status de pagamentos.</p>
      </div>
      <div className="card empty-state">
        <div className="empty-state-icon">💳</div>
        <p style={{ margin: 0 }}>
          Integração com Mercado Pago ainda não está ativa — em breve você verá aqui o extrato de
          repasses de cada pedido.
        </p>
      </div>
    </div>
  );
}
