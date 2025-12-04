/**
 * Format Angka ke Rupiah (IDR) atau USD
 */
export const formatCurrency = (amount, currency = 'IDR') => {
    if (!amount) amount = 0;
    
    // Jika input string angka "1000000.00", convert ke float
    const num = parseFloat(amount);

    if (currency === 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(num);
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(num);
};

/**
 * Format Tanggal (YYYY-MM-DD) ke Indonesia (DD MMMM YYYY)
 */
export const formatDate = (dateString, includeTime = false) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    
    // Cek validitas date
    if (isNaN(date.getTime())) return dateString;

    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };

    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }

    return date.toLocaleDateString('id-ID', options);
};

/**
 * Format Status untuk Label Warna (Badge)
 */
export const getStatusColor = (status) => {
    switch (status) {
        case 'active':
        case 'verified':
        case 'confirmed':
        case 'paid':
        case 'completed':
        case 'lunas':
            return 'bg-green-100 text-green-700 border-green-200';
        
        case 'pending':
        case 'draft':
        case 'dp':
        case 'processing':
            return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            
        case 'cancelled':
        case 'rejected':
        case 'inactive':
        case 'lost':
            return 'bg-red-100 text-red-700 border-red-200';
            
        default:
            return 'bg-gray-100 text-gray-700 border-gray-200';
    }
};