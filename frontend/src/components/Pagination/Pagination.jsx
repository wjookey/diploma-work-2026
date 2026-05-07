import styles from './Pagination.module.scss';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ pagination, onPageChange }) => {
    const { page, totalPages, total, limit } = pagination;
        
    const getPageNumbers = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];
        let l;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
                range.push(i);
            }
        }

        range.forEach((i) => {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        });

        return rangeWithDots;
    };

    const startItem = (page - 1) * limit + 1;
    const endItem = Math.min(page * limit, total);

    return (
        <div className={styles.pagination}>
            <div className={styles.paginationInfo}>
                Показано {startItem}-{endItem} из {total}
            </div>
            <div className={styles.paginationControls}>
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className={styles.paginationButton}
                >
                    <ChevronLeft className={styles.icon} />
                </button>
                
                {getPageNumbers().map((pageNum, index) => (
                    <button
                        key={index}
                        onClick={() => typeof pageNum === 'number' && onPageChange(pageNum)}
                        className={`${styles.paginationButton} ${pageNum === page ? styles.active : ''}`}
                        disabled={pageNum === '...'}
                    >
                        {pageNum}
                    </button>
                ))}
                    
                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages}
                    className={styles.paginationButton}
                >
                    <ChevronRight className={styles.icon} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;