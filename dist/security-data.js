/* Cross-category editorial tags. Each entry states its role in the workflow. */
const WORK_FIELDS = {
 cybersecurity: {label:'An ninh mạng · tất cả', keywords:'cybersecurity cyber security an ninh mạng bảo mật security infosec'},
 pentest: {label:'Pentest · Web & API', keywords:'pentest pentesting pen test penetration testing web security kiểm thử xâm nhập kiểm thử bảo mật web api'},
 appsec: {label:'AppSec · Bảo mật ứng dụng', keywords:'appsec application security secure code review sast devsecops bảo mật ứng dụng rà soát mã'},
 soc: {label:'SOC · Phòng thủ & ứng phó', keywords:'soc blue team detection incident response dfir triage phòng thủ ứng phó sự cố'},
 osint: {label:'OSINT · Nghiên cứu bảo mật', keywords:'osint open source intelligence threat research cve advisory nghiên cứu bảo mật thông tin công khai'}
};

const SECURITY_PROFILES = {
 'burp-suite': {
  fields:['pentest','appsec'], role:'Công cụ chuyên dụng',
  note:'Phân tích lưu lượng HTTP, kiểm thử web và API trong phạm vi cho phép, rồi xác minh phát hiện trong Burp.'
 },
 semgrep: {
  fields:['appsec'], role:'Công cụ chuyên dụng',
  note:'Rà soát mã, phụ thuộc và secrets trong CI, rồi dùng AI để hỗ trợ phân loại phát hiện và xem bản sửa.'
 },
 'microsoft-security-copilot': {
  fields:['soc'], role:'Công cụ chuyên dụng',
  note:'Tóm tắt cảnh báo, đối chiếu tín hiệu từ Defender hoặc Sentinel và hỗ trợ điều tra sự cố.'
 },
 'github-copilot': {
  fields:['appsec'], role:'Hỗ trợ quy trình',
  note:'Giải thích cảnh báo code scanning và đề xuất bản sửa với Copilot Autofix khi được bật trong repo.',
  source:'https://docs.github.com/en/code-security/concepts/code-scanning/autofix-for-code-scanning'
 },
 'claude-code': {
  fields:['pentest','appsec'], role:'Hỗ trợ quy trình',
  note:'Đọc luồng xác thực và phân quyền trong repo, sau đó viết kiểm thử hồi quy cho bản sửa.'
 },
 codex: {
  fields:['pentest','appsec'], role:'Hỗ trợ quy trình',
  note:'Phân tích nguyên nhân trong mã nguồn và tạo kiểm thử tái hiện trong môi trường lab.'
 },
 cursor: {
  fields:['appsec'], role:'Hỗ trợ quy trình',
  note:'Lần theo dữ liệu đầu vào trong codebase, rà soát bản sửa và thêm kiểm thử bảo mật.'
 },
 opencode: {
  fields:['pentest','appsec'], role:'Hỗ trợ quy trình',
  note:'Đọc mã và chuẩn bị script kiểm thử hồi quy trong môi trường được cấp phép.'
 },
 chatgpt: {
  fields:['pentest'], role:'Hỗ trợ quy trình',
  note:'Soạn checklist kiểm thử và bản nháp báo cáo từ các phát hiện đã xác minh.'
 },
 claude: {
  fields:['pentest'], role:'Hỗ trợ quy trình',
  note:'Tổng hợp bằng chứng đã chọn, viết mô tả tác động và đề xuất hướng khắc phục cho báo cáo.'
 },
 perplexity: {
  fields:['osint'], role:'Hỗ trợ quy trình',
  note:'Tìm advisory và thông tin CVE công khai, sau đó đối chiếu từng trích dẫn với nguồn gốc.'
 },
 'gemini-notebook': {
  fields:['osint'], role:'Hỗ trợ quy trình',
  note:'Tổng hợp advisory và tài liệu kỹ thuật đã chọn, có thể lần lại nguồn trích dẫn.'
 },
 ollama: {
  fields:['pentest','soc'], role:'Hỗ trợ quy trình',
  note:'Chạy model local để tóm tắt log hoặc ghi chú đã chọn khi toàn bộ cấu hình suy luận nằm trên máy.'
 },
 n8n: {
  fields:['soc'], role:'Hỗ trợ quy trình',
  note:'Luân chuyển cảnh báo và tạo ticket triage qua các tích hợp do đội SOC cấu hình.'
 }
};
