/* Melhorias para Drag & Drop */
.professor-item.dragging {
    opacity: 0.6;
    transform: scale(0.95);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.grade-aula-cell.drag-over {
    background: #e3f2fd !important;
    border: 2px dashed #2196f3 !important;
    animation: pulse 1s infinite;
}

@keyframes pulse {
    0% { border-color: #2196f3; }
    50% { border-color: #64b5f6; }
    100% { border-color: #2196f3; }
}

/* Feedback visual para células que aceitam drop */
.grade-aula-cell.vazia:hover {
    background: #f8f9fa;
    border: 1px dashed #6c757d;
}

/* Context menu styles */
.context-menu {
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 0.375rem;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    min-width: 180px;
}

.context-menu .list-group-item {
    border: none;
    padding: 8px 12px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.context-menu .list-group-item:hover {
    background: #f8f9fa;
}

.context-menu .list-group-item.text-danger:hover {
    background: #f8d7da;
}
