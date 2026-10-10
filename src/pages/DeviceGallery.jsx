import { Navigate, useParams } from 'react-router';

export default function DeviceGallery() {
  const { device } = useParams();
  const selected = ['mobile', 'tablet', 'laptop'].includes(device) ? device : 'mobile';
  return <Navigate replace to={`/services/schedule-wallpaper?device=${selected}`} />;
}
