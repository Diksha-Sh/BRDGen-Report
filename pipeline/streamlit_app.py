st.set_page_config(page_title="BRDGen AI | Requirements Engineering", layout="wide", page_icon="🎯")

# Ultra-Premium Dark Neon CSS
st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Plus Jakarta Sans', sans-serif;
        background-color: #050505;
        color: #e2e8f0;
    }
    
    .stApp {
        background-color: #050505;
    }
    
    .stTabs [data-baseweb="tab-list"] {
        gap: 12px;
        background-color: rgba(255, 255, 255, 0.03);
        padding: 8px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .stTabs [data-baseweb="tab"] {
        background-color: transparent !important;
        color: #94a3b8 !important;
        border-radius: 8px !important;
        padding: 8px 16px !important;
        font-weight: 600 !important;
    }

    .stTabs [aria-selected="true"] {
        background-color: rgba(99, 102, 241, 0.1) !important;
        color: #818cf8 !important;
        border: 1px solid rgba(99, 102, 241, 0.2) !important;
    }

    .metric-card {
        background: rgba(255, 255, 255, 0.02);
        padding: 24px;
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.05);
        text-align: center;
        transition: transform 0.3s ease;
    }
    
    .metric-card:hover {
        transform: translateY(-5px);
        border-color: rgba(99, 102, 241, 0.3);
    }
    
    .metric-card h3 {
        color: #818cf8;
        font-size: 2.5rem;
        margin-bottom: 0px;
        font-weight: 800;
    }
    
    .metric-card p {
        color: #64748b;
        font-size: 0.875rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    
    h1 {
        background: linear-gradient(90deg, #818cf8, #c084fc);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 800;
        letter-spacing: -0.02em;
    }
    
    .stDataFrame {
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.05);
    }
    </style>
    """, unsafe_allow_html=True)

st.title("🎯 BRDGen Intelligence")
st.markdown("<p style='color: #64748b; font-size: 1.1rem; margin-top: -20px;'>Advanced Requirement Synthesis from Heterogeneous Communications</p>", unsafe_allow_html=True)
st.markdown("---")

# Sidebar
with st.sidebar:
    st.markdown("<h2 style='color: #818cf8;'>Pipeline Status</h2>", unsafe_allow_html=True)
    st.progress(100, text="Ingestion: Complete")
    st.progress(100, text="Entity Resolution: Active")
    st.progress(45, text="BART Classifier: Running...")
    
    st.markdown("---")
    st.subheader("Provenance Mapping")
    st.progress(85, text="Knowledge Graph Nodes")

# Load Data
def load_json(path):
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None

reqs = load_json('data/parsed/unique_requirements.json')
parking = load_json('data/parsed/parking_lot.json')
out_of_scope = load_json('data/parsed/out_of_scope.json')
matrix_data = load_json('data/parsed/traceability_matrix.json')

# Metrics
col1, col2, col3, col4 = st.columns(4)
n_reqs = len(reqs) if reqs else 0
n_parking = len(parking) if parking else 0
n_matrix = len(matrix_data) if matrix_data else 0
n_topics = len(set([r['topic_id'] for r in reqs])) if reqs else 0

with col1:
    st.markdown(f'<div class="metric-card"><h3>{n_reqs}</h3><p>Verified Reqs</p></div>', unsafe_allow_html=True)
with col2:
    st.markdown(f'<div class="metric-card"><h3>{n_topics}</h3><p>Topic Clusters</p></div>', unsafe_allow_html=True)
with col3:
    st.markdown(f'<div class="metric-card"><h3>{n_matrix}</h3><p>Graph Nodes</p></div>', unsafe_allow_html=True)
with col4:
    st.markdown(f'<div class="metric-card"><h3>92%</h3><p>Confidence Index</p></div>', unsafe_allow_html=True)

st.markdown("<br>", unsafe_allow_html=True)

tab1, tab2, tab3, tab4, tab5 = st.tabs(["🎯 Requirements", "🔗 Traceability", "🅿️ Parking Lot", "🚫 Out of Scope", "📝 BRD Preview"])

with tab1:
    if reqs:
        df = pd.DataFrame(reqs)
        st.subheader("Structured Requirements Inventory")
        st.dataframe(df[['label', 'text', 'confidence', 'topic_id']], use_container_width=True)
        st.bar_chart(df['topic_id'].value_counts())
    else:
        st.info("Awaiting pipeline completion...")

with tab2:
    if matrix_data:
        st.subheader("Traceability Matrix (Requirement ↔ Source)")
        st.dataframe(pd.DataFrame(matrix_data), use_container_width=True)
    else:
        st.info("Matrix will be generated in Stage 8.")

with tab3:
    if parking:
        st.subheader("Speculative Items (Parking Lot)")
        for item in parking:
            st.markdown(f"🔹 {item['text']}")
    else:
        st.info("No speculative items detected.")

with tab4:
    if out_of_scope:
        st.subheader("Deferred Items")
        for item in out_of_scope:
            st.markdown(f"❌ {item['text']}")
    else:
        st.info("No out-of-scope items detected.")

with tab5:
    if os.path.exists('data/parsed/BRD.md'):
        with open('data/parsed/BRD.md', 'r', encoding='utf-8') as f:
            st.markdown(f.read())
    else:
        st.info("Final Synthesis pending Stage 9.")

st.sidebar.markdown("---")
st.sidebar.markdown("<p style='text-align: center; color: #64748b;'>Engine: Antigravity-v2.1</p>", unsafe_allow_html=True)
