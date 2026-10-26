import ChinaMap from "../../components/china-map/index.jsx";
import "./index.css";

// Layer 4: 首页右侧 — 全国设备分布地图,直接铺满(无 padding/无标题/无卡片装饰)
export default function OverviewView() {
  return (
    <div className="overview-view">
      <div className="map-body">
        <ChinaMap />
      </div>
    </div>
  );
}
