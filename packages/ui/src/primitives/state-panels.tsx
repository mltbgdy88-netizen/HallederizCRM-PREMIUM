export function LoadingState({ title = "Yukleniyor", message }: { title?: string; message: string }) {
  return (
    <div className="hz-state-card">
      <div className="hz-state-skeleton" />
      <h4>{title}</h4>
      <p>{message}</p>
    </div>
  );
}

export function EmptyState({ title = "Kayit Bulunamadi", message }: { title?: string; message: string }) {
  return (
    <div className="hz-state-card">
      <h4>{title}</h4>
      <p>{message}</p>
    </div>
  );
}

export function ErrorState({ title = "Bir Hata Olustu", message }: { title?: string; message: string }) {
  return (
    <div className="hz-state-card tone-danger">
      <h4>{title}</h4>
      <p>{message}</p>
    </div>
  );
}
