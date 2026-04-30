interface ErrorModalProps {
  message: string
  onClose: () => void
}

export const ErrorModal = ({ message, onClose }: ErrorModalProps) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="error-modal" onClick={e => e.stopPropagation()}>
      <div className="error-modal-icon">
        <i className="ri-error-warning-line" />
      </div>
      <h3 className="error-modal-title">エラーが発生しました</h3>
      <p className="error-modal-message">{message}</p>
      <button className="error-modal-btn" onClick={onClose}>閉じる</button>
    </div>
  </div>
)
