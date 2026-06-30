# PharmaTech - System Architecture

---

## 🏗️ High-Level Architecture

```mermaid
graph TB
    subgraph "Electron Main Process"
        A[Main.js] --> B[Database Manager]
        A --> C[IPC Handlers]
        B --> D[(Better-SQLite3<br/>Local Database)]
    end
    
    subgraph "Electron Renderer Process"
        E[React Application] --> F[Components]
        E --> G[Context Providers]
        E --> H[Custom Hooks]
        F --> I[Pages]
        F --> J[Common Components]
    end
    
    C <-->|IPC Communication| E
    G --> K[Language Context]
    G --> L[Theme Context]
    H --> M[useDatabase Hook]
    M -->|electronAPI| C
```

---

## 🔄 Data Flow Architecture

```mermaid
sequenceDiagram
    participant UI as React UI
    participant Hook as useDatabase Hook
    participant IPC as IPC Bridge
    participant Main as Main Process
    participant DB as SQLite Database
    
    UI->>Hook: Request Data
    Hook->>IPC: electronAPI.getProducts()
    IPC->>Main: IPC Handler
    Main->>DB: SQL Query
    DB-->>Main: Result Set
    Main-->>IPC: Return Data
    IPC-->>Hook: Promise Resolved
    Hook-->>UI: Update State
```

---

## 📦 Component Hierarchy

```mermaid
graph TD
    A[App.jsx] --> B[LanguageProvider]
    B --> C[Router]
    C --> D[Layout]
    D --> E[Header]
    D --> F[Sidebar]
    D --> G[Main Content]
    D --> H[Footer]
    
    G --> I[Dashboard]
    G --> J[Inventory Module]
    G --> K[Purchases Module]
    G --> L[Sales Module]
    G --> M[Payments Module]
    
    J --> N[InventoryList]
    J --> O[AddProduct]
    J --> P[EditProduct]
    J --> Q[ProductDetails]
```

---

## 🗄️ Database Schema Relationships

```mermaid
erDiagram
    CATEGORIES ||--o{ PRODUCTS : contains
    PRODUCTS ||--o{ INVENTORY : tracks
    PRODUCTS ||--o{ INVENTORY_TRANSACTIONS : records
    
    CATEGORIES {
        int id PK
        string name_ar
        string name_en
        string description_ar
        string description_en
        int parent_id FK
        datetime created_at
    }
    
    PRODUCTS {
        int id PK
        string barcode UK
        string name_ar
        string name_en
        string description_ar
        string description_en
        int category_id FK
        string unit_type
        int reorder_level
        boolean is_active
        datetime created_at
        datetime updated_at
    }
    
    INVENTORY {
        int id PK
        int product_id FK
        string batch_number
        int quantity
        decimal cost_price
        decimal selling_price
        date expiry_date
        date manufacture_date
        string location
        datetime created_at
        datetime updated_at
    }
    
    INVENTORY_TRANSACTIONS {
        int id PK
        int product_id FK
        string transaction_type
        int quantity
        string reference_type
        int reference_id
        string notes
        int user_id
        datetime created_at
    }
```

---

## 🔐 Security Architecture

```mermaid
graph LR
    A[Renderer Process] -->|Context Isolation| B[Preload Script]
    B -->|Exposed API| C[IPC Bridge]
    C -->|Validated Requests| D[Main Process]
    D -->|Parameterized Queries| E[Database]
    
    style A fill:#e3f2fd
    style B fill:#fff3e0
    style C fill:#f3e5f5
    style D fill:#e8f5e9
    style E fill:#fce4ec
```

### Security Layers

1. **Context Isolation**: Renderer process cannot directly access Node.js APIs
2. **Preload Script**: Whitelist-only API exposure via `contextBridge`
3. **IPC Validation**: All requests validated before processing
4. **Parameterized Queries**: SQL injection prevention
5. **Local Storage**: Database stored in secure user data directory

---

## 🌐 Internationalization Flow

```mermaid
graph TD
    A[User Selects Language] --> B{Language Context}
    B -->|Arabic| C[Load ar.json]
    B -->|English| D[Load en.json]
    C --> E[Set dir=rtl]
    D --> F[Set dir=ltr]
    E --> G[Apply RTL Styles]
    F --> H[Apply LTR Styles]
    G --> I[Render UI]
    H --> I
    I --> J[Save Preference to DB]
```

---

## 📱 Module Structure

### Inventory Management Module

```mermaid
graph TD
    A[Inventory Module] --> B[List View]
    A --> C[Add Product]
    A --> D[Edit Product]
    A --> E[Product Details]
    A --> F[Stock Management]
    
    B --> G[Search & Filter]
    B --> H[Pagination]
    B --> I[Bulk Actions]
    
    C --> J[Form Validation]
    C --> K[Category Selection]
    C --> L[Barcode Scanner]
    
    F --> M[Stock In]
    F --> N[Stock Out]
    F --> O[Stock Adjustment]
    F --> P[Transaction History]
```

---

## 🔄 State Management

```mermaid
graph LR
    A[Component] --> B[useState]
    A --> C[useContext]
    A --> D[Custom Hooks]
    
    B --> E[Local State]
    C --> F[Global State]
    D --> G[Database State]
    
    F --> H[Language]
    F --> I[Theme]
    F --> J[User Preferences]
    
    G --> K[Products]
    G --> L[Categories]
    G --> M[Inventory]
```

---

## 🚀 Build & Deployment Pipeline

```mermaid
graph LR
    A[Source Code] --> B[Vite Build]
    B --> C[React Bundle]
    C --> D[Electron Builder]
    D --> E{Platform}
    E -->|macOS| F[.dmg Package]
    E -->|Windows| G[.exe Installer]
    F --> H[Distribution]
    G --> H
```

---

## 📊 Performance Optimization Strategy

### Database Optimization
- **Indexing**: Create indexes on frequently queried columns
- **WAL Mode**: Write-Ahead Logging for better concurrency
- **Prepared Statements**: Reuse compiled SQL statements
- **Batch Operations**: Group multiple operations in transactions

### UI Optimization
- **Code Splitting**: Lazy load routes and components
- **Memoization**: Use React.memo for expensive components
- **Virtual Scrolling**: For large lists (inventory, transactions)
- **Debouncing**: Search and filter operations

### Memory Management
- **Database Connection**: Single persistent connection
- **Resource Cleanup**: Proper cleanup in useEffect hooks
- **Image Optimization**: Compress and cache product images

---

## 🔍 Monitoring & Logging

```mermaid
graph TD
    A[Application Events] --> B{Event Type}
    B -->|Error| C[Error Logger]
    B -->|Info| D[Info Logger]
    B -->|Debug| E[Debug Logger]
    
    C --> F[Log File]
    D --> F
    E --> F
    
    F --> G[Log Rotation]
    G --> H[Archive]
```

---

## 🧪 Testing Strategy

### Unit Tests
- Database operations
- Utility functions
- Validation logic
- Component logic

### Integration Tests
- IPC communication
- Database transactions
- Component interactions
- Form submissions

### E2E Tests
- User workflows
- Module navigation
- Data persistence
- Language switching

---

## 📈 Scalability Considerations

### Current Architecture (Phase 1)
- Single-user desktop application
- Local SQLite database
- Offline-first approach

### Future Enhancements
- Multi-user support with user authentication
- Cloud sync capabilities
- Real-time updates across devices
- Mobile companion app
- API for third-party integrations

---

## 🔧 Technology Stack Details

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Desktop Framework | Electron | Latest | Cross-platform desktop app |
| UI Framework | React | 18.x | Component-based UI |
| Build Tool | Vite | Latest | Fast development and building |
| Database | Better-SQLite3 | Latest | Local data storage |
| Routing | React Router | 6.x | Client-side navigation |
| Internationalization | i18next | Latest | Multi-language support |
| Styling | CSS3 | - | Custom styling with RTL support |

---

## 🎯 Design Principles

1. **Offline-First**: Application works without internet connection
2. **Bilingual**: Full Arabic and English support with RTL
3. **User-Friendly**: Intuitive interface for pharmacy staff
4. **Secure**: Local data storage with proper validation
5. **Performant**: Fast operations even with large datasets
6. **Maintainable**: Clean code structure and documentation
7. **Extensible**: Easy to add new modules and features

---

**Document Version:** 1.0  
**Last Updated:** 2026-06-30