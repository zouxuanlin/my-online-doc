import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { documentService } from '@/services/document.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface DocumentNode {
  id: string;
  title: string;
  content?: string;
}

export default function KnowledgeGraph() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 获取所有文档
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const result = await documentService.getList({ pageSize: 100 });
      setDocuments(result.list || []);
    } catch (err: any) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  // 提取文档中的链接
  const extractLinks = useCallback((content: string): string[] => {
    if (!content) return [];
    const regex = /\[\[(.*?)\]\]/g;
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      matches.push(match[1]);
    }
    return matches;
  }, []);

  // 创建节点和边
  const { nodes, edges } = useMemo(() => {
    // 过滤搜索
    const filteredDocs = documents.filter(doc =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 创建节点
    const nodeMap: Record<string, Node> = {};
    const edgeList: Edge[] = [];

    filteredDocs.forEach((doc) => {
      // 为每个文档创建节点
      if (!nodeMap[doc.id]) {
        nodeMap[doc.id] = {
          id: doc.id,
          position: { x: Math.random() * 500, y: Math.random() * 500 },
          data: {
            label: doc.title,
            content: doc.content,
          },
          style: {
            padding: '10px 15px',
            borderRadius: '8px',
            border: '2px solid hsl(var(--primary))',
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            fontSize: '12px',
            fontWeight: '500',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          },
        };
      }

      // 提取文档中的链接
      const links = extractLinks(doc.content || '');
      links.forEach((linkTitle) => {
        // 查找链接目标文档
        const targetDoc = documents.find(d => d.title === linkTitle);
        if (targetDoc && !nodeMap[targetDoc.id]) {
          nodeMap[targetDoc.id] = {
            id: targetDoc.id,
            position: { x: Math.random() * 500, y: Math.random() * 500 },
            data: {
              label: targetDoc.title,
            },
            style: {
              padding: '10px 15px',
              borderRadius: '8px',
              border: '2px solid hsl(var(--muted-foreground))',
              background: 'hsl(var(--muted))',
              color: 'hsl(var(--muted-foreground))',
              fontSize: '12px',
              fontWeight: '500',
              opacity: 0.7,
            },
          };
        }

        if (targetDoc) {
          edgeList.push({
            id: `${doc.id}-${targetDoc.id}`,
            source: doc.id,
            target: targetDoc.id,
            type: 'smoothstep',
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: 'hsl(var(--muted-foreground))',
            },
            style: {
              stroke: 'hsl(var(--muted-foreground))',
              strokeWidth: 1.5,
            },
          });
        }
      });
    });

    return {
      nodes: Object.values(nodeMap),
      edges: edgeList,
    };
  }, [documents, searchTerm, extractLinks]);

  const [nodesState, setNodes, onNodesChange] = useNodesState(nodes);
  const [edgesState, setEdges, onEdgesChange] = useEdgesState(edges);

  // 当文档变化时更新节点
  useEffect(() => {
    setNodes(nodes);
  }, [nodes, setNodes]);

  useEffect(() => {
    setEdges(edges);
  }, [edges, setEdges]);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      navigate(`/documents/${node.id}`);
    },
    [navigate]
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">加载知识图谱...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)]">
      {/* 顶部工具栏 */}
      <div className="border-b px-4 py-2 flex items-center justify-between bg-card">
        <div>
          <h1 className="text-lg font-semibold">知识图谱</h1>
          <p className="text-sm text-muted-foreground">
            {nodes.length} 个文档，{edges.length} 个链接
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索文档..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-64"
          />
        </div>
      </div>

      {/* React Flow 画布 */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodesState}
          edges={edgesState}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          fitView
          attributionPosition="bottom-left"
        >
          <Controls />
          <Background color="#888" gap={16} size={1} />
          <Panel position="top-right" className="bg-card border rounded-md p-2 shadow-lg">
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded border-2 border-primary" />
                <span>当前文档</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded border-2 border-muted-foreground opacity-70" />
                <span>链接文档</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-muted-foreground" />
                <span>文档链接</span>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}
