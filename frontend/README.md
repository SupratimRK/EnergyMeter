# Energy Meter Dashboard - Frontend

A modern, responsive React dashboard for smart energy meter management. Built with React, Vite, Tailwind CSS, and Lucide React icons.

## ✨ Features

### 🎯 Core Features
- **Real-time Monitoring**: Live energy consumption data with WebSocket connectivity
- **Balance Management**: Account balance tracking, recharge functionality, and transaction history
- **Device Control**: Remote meter control and status monitoring
- **Analytics Dashboard**: Consumption patterns and cost analysis
- **Smart Alerts**: Configurable notifications for low balance, high consumption, etc.

### 🎨 UI/UX Features
- **Modern Design**: Clean, elegant interface with smooth animations
- **Mobile Responsive**: Optimized for all screen sizes (mobile-first approach)
- **Dark/Light Theme**: Theme switching with system preference detection
- **Interactive Charts**: Rich data visualizations using Recharts
- **Real-time Updates**: Live data updates without page refresh
- **Progressive Web App**: Installable as mobile app

### 📱 Mobile Optimization
- **Touch-friendly**: Large tap targets and gesture support
- **Responsive Layouts**: Adapts seamlessly to different screen sizes
- **Mobile Menu**: Slide-out navigation for mobile devices
- **Optimized Performance**: Fast loading and smooth scrolling
- **Offline Support**: Basic functionality works offline

## 🛠️ Technology Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm (or yarn)
- Backend server running on http://localhost:3000

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**:
   Navigate to `http://localhost:3001`

### Production Build

```bash
npm run build
npm run preview
```

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🏗️ Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable components
│   │   ├── Dashboard/     # Dashboard-specific components
│   │   ├── Layout/        # Layout components (Header, Sidebar)
│   │   └── UI/           # Common UI components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API services and utilities
│   ├── utils/            # Helper functions
│   ├── App.jsx           # Main App component
│   ├── main.jsx          # App entry point
│   └── index.css         # Global styles
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🔌 API Integration

The dashboard connects to the energy meter simulation server:

### Base URL
```javascript
const API_BASE_URL = 'http://localhost:3000/api';
```

### Key Endpoints Used
- `GET /api/realtime` - Current meter readings
- `GET /api/balance` - Account balance
- `POST /api/balance/recharge` - Recharge account
- `GET /api/historical` - Historical consumption data
- `GET /api/device/status` - Device status
- `WebSocket: ws://localhost:3000/realtime/stream` - Live updates

### WebSocket Connection
Real-time data is received via WebSocket connection with automatic reconnection:

```javascript
const ws = new WebSocket('ws://localhost:3000/realtime/stream');
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Mobile Features
- Collapsible sidebar navigation
- Touch-optimized controls
- Swipe gestures
- Responsive charts and tables
- Mobile-specific menu

## 🎨 Customization

### Theming
Colors and themes can be customized in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: { /* Custom primary colors */ },
      // Add your custom colors
    }
  }
}
```

### Components
All components are modular and can be easily customized:

- Modify styles in component files
- Update colors in Tailwind config
- Add new components in `src/components/`

## 📊 Dashboard Sections

### 1. **Real-time Metrics**
- Voltage, Current, Power readings
- Live connection status
- Animated indicators

### 2. **Power Consumption Chart**
- Interactive time-series charts
- Multiple view modes (Area/Line)
- Time range selection

### 3. **Balance Management**
- Current balance display
- Quick recharge options
- Transaction history
- Low balance alerts

### 4. **Device Status**
- Connection monitoring
- Temperature and signal strength
- Remote control capabilities

### 5. **Analytics** (Coming Soon)
- Consumption patterns
- Cost analysis
- Efficiency reports

## 🔧 Configuration

### Environment Variables
Create a `.env` file for configuration:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000/realtime/stream
```

### API Configuration
Update API endpoints in `src/services/api.js`:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Static Hosting
The `dist` folder can be deployed to:
- Netlify
- Vercel
- GitHub Pages
- AWS S3
- Any static hosting service

### Docker Deployment
Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "run", "preview"]
```

## 🔒 Security

- API requests include proper headers
- Input validation on forms
- XSS protection
- CORS handling
- Secure WebSocket connections

## 📈 Performance

- **Code Splitting**: Automatic route-based splitting
- **Lazy Loading**: Components loaded on demand
- **Optimized Images**: Proper image compression
- **Caching**: Browser caching strategies
- **Bundle Analysis**: Use `npm run build` to analyze

## 🐛 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Ensure backend server is running
   - Check WebSocket URL in configuration

2. **API Errors**
   - Verify backend server is accessible
   - Check CORS configuration

3. **Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility

### Debug Mode
Enable debug logging by setting:
```javascript
localStorage.setItem('debug', 'true');
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with proper testing
4. Submit a pull request

## 📱 Mobile App Features

### PWA Capabilities
- Installable on mobile devices
- Offline functionality
- Push notifications (coming soon)
- App-like navigation

### Mobile-Specific Features
- Touch gestures for charts
- Swipe navigation
- Mobile-optimized forms
- Responsive tables

## 🔮 Future Enhancements

### Planned Features
- **Advanced Analytics**: Detailed consumption analysis
- **Push Notifications**: Real-time alerts
- **Multi-language Support**: Internationalization
- **Themes**: Multiple color schemes
- **Export Features**: PDF/Excel reports
- **Voice Commands**: Voice control integration

### Technical Improvements
- **Service Worker**: Better offline support
- **State Management**: Redux/Zustand integration
- **Testing**: Unit and integration tests
- **Performance**: Further optimizations

## 📞 Support

For technical support or questions:
- **Email**: support@energymeter.com
- **Documentation**: Check the API docs
- **Issues**: Create GitHub issues for bugs

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for modern energy management**
