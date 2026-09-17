// ==========================================
// CARÔ BEAUTY - ADMIN
// Supabase
// ==========================================

const SUPABASE_URL =
    "https://ehxqgrhpgizekwbqrdwp.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_sYXKhTNj_j6sSGSZkwNkAg_i1P5UAGO";

const SENHA_ADMIN = "caro123";

let supabaseClient = null;

let produtos = [];

let produtoEditando = null;


// ==========================================
// INICIAR
// ==========================================

function iniciarSupabase() {

    if (window.supabase) {

        criarClienteSupabase();

        return;
    }

    const script =
        document.createElement("script");

    script.src =
        "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

    script.onload = () => {

        criarClienteSupabase();

    };

    script.onerror = () => {

        alert(
            "Não foi possível carregar o Supabase."
        );

    };

    document.head.appendChild(script);
}


function criarClienteSupabase() {

    supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
        );

}


// ==========================================
// LOGIN
// ==========================================

function entrarAdmin() {

    const senha =
        document
            .getElementById("senhaAdmin")
            .value;

    const erro =
        document.getElementById("erroLogin");

    if (senha === SENHA_ADMIN) {

        document
            .getElementById("telaLogin")
            .style.display = "none";

        document
            .getElementById("painelAdmin")
            .style.display = "block";

        carregarProdutos();

    } else {

        erro.textContent =
            "Senha incorreta.";

    }

}


function sairAdmin() {

    document
        .getElementById("painelAdmin")
        .style.display = "none";

    document
        .getElementById("telaLogin")
        .style.display = "flex";

    document
        .getElementById("senhaAdmin")
        .value = "";

}


// ==========================================
// CARREGAR PRODUTOS DO SUPABASE
// ==========================================

async function carregarProdutos() {

    if (!supabaseClient) {

        iniciarSupabase();

        setTimeout(() => {

            carregarProdutos();

        }, 500);

        return;
    }

    const lista =
        document.getElementById(
            "listaProdutosAdmin"
        );

    lista.innerHTML =
        "<p>Carregando produtos...</p>";

    try {

        const { data, error } =
            await supabaseClient
                .from("produtos")
                .select("*")
                .order("created_at", {
                    ascending: false
                });

        if (error) {

            console.error(error);

            lista.innerHTML =
                "<p>Erro ao carregar produtos.</p>";

            alert(
                "Erro ao carregar produtos: " +
                error.message
            );

            return;
        }

        produtos = data || [];

        mostrarProdutos();

    } catch (erro) {

        console.error(erro);

        alert(
            "Erro ao conectar com o Supabase."
        );

    }

}


// ==========================================
// MOSTRAR PRODUTOS
// ==========================================

function mostrarProdutos() {

    const lista =
        document.getElementById(
            "listaProdutosAdmin"
        );

    lista.innerHTML = "";

    if (produtos.length === 0) {

        lista.innerHTML = `
            <p>
                Nenhum produto cadastrado.
            </p>
        `;

        return;
    }

    produtos.forEach(produto => {

        const card =
            document.createElement("div");

        card.className =
            "produto-admin";

        const imagem =
            produto.imagem_url || "";

        const estoque =
            produto.estoque === true;

        card.innerHTML = `

            <div class="produto-admin-imagem">

                ${
                    imagem
                    ?
                    `<img
                        src="${imagem}"
                        alt="${escaparHTML(produto.nome)}"
                    >`
                    :
                    `<span>CARÔ BEAUTY</span>`
                }

            </div>

            <div class="produto-admin-info">

                <span class="produto-admin-categoria">
                    ${escaparHTML(
                        produto.categoria || "Outros"
                    )}
                </span>

                <h3>
                    ${escaparHTML(
                        produto.nome || ""
                    )}
                </h3>

                <p>
                    ${escaparHTML(
                        produto.descricao || ""
                    )}
                </p>

                <strong>
                    R$ ${formatarPreco(
                        produto.preco
                    )}
                </strong>

                <div class="produto-admin-estoque">

                    <span>
                        ${
                            estoque
                            ? "🟢 Em estoque"
                            : "🔴 Sem estoque"
                        }
                    </span>

                    <button
                        onclick="alternarEstoque(${produto.id})"
                    >
                        ${
                            estoque
                            ? "Marcar sem estoque"
                            : "Marcar em estoque"
                        }
                    </button>

                </div>

                <div class="produto-admin-acoes">

                    <button
                        onclick="editarProduto(${produto.id})"
                    >
                        EDITAR
                    </button>

                    <button
                        onclick="excluirProduto(${produto.id})"
                    >
                        EXCLUIR
                    </button>

                </div>

            </div>

        `;

        lista.appendChild(card);

    });

}


// ==========================================
// ABRIR NOVO PRODUTO
// ==========================================

function abrirFormularioProduto() {

    produtoEditando = null;

    const formulario =
        document.getElementById(
            "formularioProduto"
        );

    formulario.style.display = "block";

    document.getElementById(
        "tituloFormulario"
    ).textContent =
        "Novo produto";

    document
        .getElementById("formProduto")
        .reset();

    document
        .getElementById("estoqueProduto")
        .value = "true";

    formulario.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// ==========================================
// FECHAR FORMULÁRIO
// ==========================================

function fecharFormularioProduto() {

    document.getElementById(
        "formularioProduto"
    ).style.display = "none";

    document
        .getElementById("formProduto")
        .reset();

    produtoEditando = null;

}


// ==========================================
// EDITAR PRODUTO
// ==========================================

function editarProduto(id) {

    const produto =
        produtos.find(
            item => Number(item.id) === Number(id)
        );

    if (!produto) return;

    produtoEditando = produto;

    document.getElementById(
        "formularioProduto"
    ).style.display = "block";

    document.getElementById(
        "tituloFormulario"
    ).textContent =
        "Editar produto";

    document.getElementById(
        "nomeProduto"
    ).value =
        produto.nome || "";

    document.getElementById(
        "descricaoProduto"
    ).value =
        produto.descricao || "";

    document.getElementById(
        "precoProduto"
    ).value =
        produto.preco || "";

    document.getElementById(
        "categoriaProduto"
    ).value =
        produto.categoria || "Outros";

    document.getElementById(
        "estoqueProduto"
    ).value =
        produto.estoque === true
            ? "true"
            : "false";

    document.getElementById(
        "formularioProduto"
    ).scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// ==========================================
// SALVAR PRODUTO
// ==========================================

async function salvarProduto(event) {

    event.preventDefault();

    if (!supabaseClient) {

        alert(
            "O Supabase ainda não foi carregado."
        );

        return;
    }

    const nome =
        document
            .getElementById("nomeProduto")
            .value
            .trim();

    const descricao =
        document
            .getElementById("descricaoProduto")
            .value
            .trim();

    const preco =
        Number(
            document
                .getElementById("precoProduto")
                .value
        );

    const categoria =
        document
            .getElementById("categoriaProduto")
            .value;

    const estoque =
        document
            .getElementById("estoqueProduto")
            .value === "true";

    const arquivo =
        document.getElementById(
            "imagemProduto"
        ).files[0];


    if (!nome) {

        alert(
            "Digite o nome do produto."
        );

        return;
    }


    if (isNaN(preco)) {

        alert(
            "Digite um preço válido."
        );

        return;
    }


    const botao =
        document.querySelector(
            ".botao-salvar-produto"
        );

    botao.disabled = true;

    botao.textContent =
        "SALVANDO...";


    try {

        let imagemURL =
            produtoEditando
                ? produtoEditando.imagem_url || ""
                : "";


        // ==================================
        // CONVERTER IMAGEM PARA BASE64
        // ==================================

        if (arquivo) {

            imagemURL =
                await converterImagem(arquivo);

        }


        const dados = {

            nome: nome,

            descricao: descricao,

            preco: preco,

            categoria: categoria,

            imagem_url: imagemURL,

            estoque: estoque

        };


        // ==================================
        // NOVO PRODUTO
        // ==================================

        if (!produtoEditando) {

            const { error } =
                await supabaseClient
                    .from("produtos")
                    .insert([dados]);

            if (error) {

                throw error;

            }

            alert(
                "Produto cadastrado com sucesso!"
            );

        }


        // ==================================
        // EDITAR PRODUTO
        // ==================================

        else {

            const { error } =
                await supabaseClient
                    .from("produtos")
                    .update(dados)
                    .eq(
                        "id",
                        produtoEditando.id
                    );

            if (error) {

                throw error;

            }

            alert(
                "Produto atualizado com sucesso!"
            );

        }


        fecharFormularioProduto();

        await carregarProdutos();


    } catch (erro) {

        console.error(erro);

        alert(
            "Não foi possível salvar o produto.\n\n" +
            erro.message
        );


    } finally {

        botao.disabled = false;

        botao.textContent =
            "SALVAR PRODUTO";

    }

}


// ==========================================
// CONVERTER IMAGEM
// ==========================================

function converterImagem(arquivo) {

    return new Promise(
        (resolve, reject) => {

            const leitor =
                new FileReader();

            leitor.onload = () => {

                resolve(
                    leitor.result
                );

            };

            leitor.onerror = () => {

                reject(
                    new Error(
                        "Não foi possível ler a imagem."
                    )
                );

            };

            leitor.readAsDataURL(arquivo);

        }
    );

}


// ==========================================
// ALTERAR ESTOQUE
// ==========================================

async function alternarEstoque(id) {

    const produto =
        produtos.find(
            item => Number(item.id) === Number(id)
        );

    if (!produto) return;

    const novoEstoque =
        produto.estoque !== true;


    try {

        const { error } =
            await supabaseClient
                .from("produtos")
                .update({
                    estoque: novoEstoque
                })
                .eq("id", id);


        if (error) {

            throw error;

        }


        produto.estoque =
            novoEstoque;

        mostrarProdutos();


    } catch (erro) {

        console.error(erro);

        alert(
            "Não foi possível alterar o estoque.\n\n" +
            erro.message
        );

    }

}


// ==========================================
// EXCLUIR PRODUTO
// ==========================================

async function excluirProduto(id) {

    const produto =
        produtos.find(
            item => Number(item.id) === Number(id)
        );

    if (!produto) return;


    const confirmar =
        confirm(
            `Excluir "${produto.nome}"?`
        );


    if (!confirmar) return;


    try {

        const { error } =
            await supabaseClient
                .from("produtos")
                .delete()
                .eq("id", id);


        if (error) {

            throw error;

        }


        produtos =
            produtos.filter(
                item =>
                    Number(item.id) !== Number(id)
            );


        mostrarProdutos();


        alert(
            "Produto excluído com sucesso!"
        );


    } catch (erro) {

        console.error(erro);

        alert(
            "Não foi possível excluir o produto.\n\n" +
            erro.message
        );

    }

}


// ==========================================
// FORMATAÇÃO
// ==========================================

function formatarPreco(valor) {

    return Number(valor || 0)
        .toFixed(2)
        .replace(".", ",");

}


// ==========================================
// SEGURANÇA DO HTML
// ==========================================

function escaparHTML(texto) {

    return String(texto || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================
// ENTER NO LOGIN
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        iniciarSupabase();


        const senha =
            document.getElementById(
                "senhaAdmin"
            );


        if (senha) {

            senha.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key === "Enter"
                    ) {

                        entrarAdmin();

                    }

                }
            );

        }

    }
);
