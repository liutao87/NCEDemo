import ChinaMap from "../../components/china-map/index.jsx";
import "./index.css";

// Layer 4: 首页右侧 — 全国设备分布地图(左侧会话卡片由 content-area 装配)
export default function OverviewView() {
  return (
    <div className="overview-view">
      <div className="chart-card map-card">
        <h3 className="chart-card-title">全国设备分布</h3>
        <div className="map-body">
          <ChinaMap />
        </div>
      </div>
    </div>
  );
}
